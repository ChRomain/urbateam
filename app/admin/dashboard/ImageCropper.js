'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Check, ZoomIn, ZoomOut, RotateCcw, Move, Crop } from 'lucide-react';

/**
 * ImageCropper
 * Modal de recadrage interactif avant upload.
 *
 * Props:
 *   - imageSrc    : string — URL de l'image source (object URL)
 *   - aspectRatio : number | null — rapport largeur/hauteur (ex: 3/4 pour portrait, 16/9 pour paysage). null = libre.
 *   - onConfirm   : (blob: Blob) => void — appelé avec l'image recadrée
 *   - onCancel    : () => void
 *   - label       : string — titre du modal
 */
export default function ImageCropper({ imageSrc, aspectRatio = null, onConfirm, onCancel, label = 'Recadrer l\'image' }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // ── État du zoom & déplacement de l'image ──────────────────────────────────
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDraggingImg, setIsDraggingImg] = useState(false);
  const dragStart = useRef(null);

  // ── État du cadre de recadrage ─────────────────────────────────────────────
  // crop en pixels relatifs au canvas d'affichage
  const [crop, setCrop] = useState(null);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [isResizingCrop, setIsResizingCrop] = useState(false);
  const resizeHandle = useRef(null); // 'tl','tr','bl','br','t','b','l','r'
  const cropDragStart = useRef(null);

  const [imgLoaded, setImgLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);

  const CANVAS_W = 700;
  const CANVAS_H = 480;
  const HANDLE_SIZE = 10;

  // ── Chargement de l'image ──────────────────────────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImgLoaded(true);

      // Centrer l'image et ajuster le zoom initial pour qu'elle remplisse le canvas
      const scaleX = CANVAS_W / img.naturalWidth;
      const scaleY = CANVAS_H / img.naturalHeight;
      const initScale = Math.max(scaleX, scaleY) * 0.85;
      setScale(initScale);
      setOffset({
        x: (CANVAS_W - img.naturalWidth * initScale) / 2,
        y: (CANVAS_H - img.naturalHeight * initScale) / 2
      });

      // Cadre de crop par défaut : 70% du canvas, centré
      const defaultW = Math.round(CANVAS_W * 0.7);
      const defaultH = aspectRatio ? Math.round(defaultW / aspectRatio) : Math.round(CANVAS_H * 0.7);
      setCrop({
        x: Math.round((CANVAS_W - defaultW) / 2),
        y: Math.round((CANVAS_H - defaultH) / 2),
        w: defaultW,
        h: defaultH
      });
    };
    img.src = imageSrc;
  }, [imageSrc, aspectRatio]);

  // ── Dessin sur le canvas ───────────────────────────────────────────────────
  useEffect(() => {
    if (!imgLoaded || !canvasRef.current || !crop) return;
    const ctx = canvasRef.current.getContext('2d');
    const img = imageRef.current;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Image
    ctx.save();
    ctx.drawImage(img, offset.x, offset.y, img.naturalWidth * scale, img.naturalHeight * scale);
    ctx.restore();

    // Masque sombre hors zone de crop
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.clearRect(crop.x, crop.y, crop.w, crop.h);
    // Re-dessiner l'image dans la zone crop (pour qu'elle soit visible, pas masquée)
    ctx.restore();

    // Re-dessiner proprement : d'abord l'image PARTOUT, puis masque HORS crop
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.drawImage(img, offset.x, offset.y, img.naturalWidth * scale, img.naturalHeight * scale);

    // Overlay sombre en dehors du crop (avec 4 rectangles)
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    // top
    ctx.fillRect(0, 0, CANVAS_W, crop.y);
    // bottom
    ctx.fillRect(0, crop.y + crop.h, CANVAS_W, CANVAS_H - crop.y - crop.h);
    // left
    ctx.fillRect(0, crop.y, crop.x, crop.h);
    // right
    ctx.fillRect(crop.x + crop.w, crop.y, CANVAS_W - crop.x - crop.w, crop.h);

    // Bordure du cadre de crop
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);

    // Lignes de tiers (règle des tiers)
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    // Verticales
    ctx.beginPath();
    ctx.moveTo(crop.x + crop.w / 3, crop.y);
    ctx.lineTo(crop.x + crop.w / 3, crop.y + crop.h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(crop.x + 2 * crop.w / 3, crop.y);
    ctx.lineTo(crop.x + 2 * crop.w / 3, crop.y + crop.h);
    ctx.stroke();
    // Horizontales
    ctx.beginPath();
    ctx.moveTo(crop.x, crop.y + crop.h / 3);
    ctx.lineTo(crop.x + crop.w, crop.y + crop.h / 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(crop.x, crop.y + 2 * crop.h / 3);
    ctx.lineTo(crop.x + crop.w, crop.y + 2 * crop.h / 3);
    ctx.stroke();
    ctx.setLineDash([]);

    // Poignées de redimensionnement (8 poignées)
    const handles = getHandles(crop);
    handles.forEach(h => {
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 4;
      ctx.fillRect(h.x - HANDLE_SIZE / 2, h.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
      ctx.shadowBlur = 0;
    });

    // Coins arrondis indicatifs
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    const cs = 14;
    [[crop.x, crop.y], [crop.x + crop.w, crop.y], [crop.x, crop.y + crop.h], [crop.x + crop.w, crop.y + crop.h]].forEach(([cx, cy]) => {
      ctx.strokeRect(cx - cs / 2, cy - cs / 2, cs, cs);
    });

  }, [imgLoaded, scale, offset, crop]);

  // ── Poignées ───────────────────────────────────────────────────────────────
  function getHandles(c) {
    return [
      { id: 'tl', x: c.x,           y: c.y },
      { id: 'tc', x: c.x + c.w / 2, y: c.y },
      { id: 'tr', x: c.x + c.w,     y: c.y },
      { id: 'ml', x: c.x,           y: c.y + c.h / 2 },
      { id: 'mr', x: c.x + c.w,     y: c.y + c.h / 2 },
      { id: 'bl', x: c.x,           y: c.y + c.h },
      { id: 'bc', x: c.x + c.w / 2, y: c.y + c.h },
      { id: 'br', x: c.x + c.w,     y: c.y + c.h },
    ];
  }

  function hitHandle(px, py, c) {
    const handles = getHandles(c);
    const hitRadius = HANDLE_SIZE + 4;
    for (const h of handles) {
      if (Math.abs(px - h.x) < hitRadius && Math.abs(py - h.y) < hitRadius) {
        return h.id;
      }
    }
    return null;
  }

  function insideCrop(px, py, c) {
    return px > c.x && px < c.x + c.w && py > c.y && py < c.y + c.h;
  }

  // ── Gestion souris ─────────────────────────────────────────────────────────
  const getCanvasPos = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (!crop) return;
    const pos = getCanvasPos(e);
    const handle = hitHandle(pos.x, pos.y, crop);

    if (handle) {
      setIsResizingCrop(true);
      resizeHandle.current = handle;
      cropDragStart.current = { pos, crop: { ...crop } };
      return;
    }

    if (insideCrop(pos.x, pos.y, crop)) {
      setIsDraggingCrop(true);
      cropDragStart.current = { pos, crop: { ...crop } };
      return;
    }

    // Drag de l'image
    setIsDraggingImg(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  }, [crop, offset, getCanvasPos]);

  const handleMouseMove = useCallback((e) => {
    if (!crop) return;
    const pos = getCanvasPos(e);

    // Resize du cadre
    if (isResizingCrop && cropDragStart.current) {
      const { pos: startPos, crop: startCrop } = cropDragStart.current;
      const dx = pos.x - startPos.x;
      const dy = pos.y - startPos.y;
      const handle = resizeHandle.current;

      let { x, y, w, h } = startCrop;
      const MIN = 40;

      if (handle.includes('r')) { w = Math.max(MIN, startCrop.w + dx); }
      if (handle.includes('b')) { h = Math.max(MIN, startCrop.h + dy); }
      if (handle.includes('l')) {
        const newW = Math.max(MIN, startCrop.w - dx);
        x = startCrop.x + (startCrop.w - newW);
        w = newW;
      }
      if (handle.includes('t')) {
        const newH = Math.max(MIN, startCrop.h - dy);
        y = startCrop.y + (startCrop.h - newH);
        h = newH;
      }

      // Maintenir le ratio si défini
      if (aspectRatio && (handle === 'br' || handle === 'tr' || handle === 'bl' || handle === 'tl')) {
        if (handle.includes('r') || handle.includes('b')) {
          h = w / aspectRatio;
        } else {
          w = h * aspectRatio;
        }
      }

      // Contraindre dans le canvas
      x = Math.max(0, x);
      y = Math.max(0, y);
      w = Math.min(w, CANVAS_W - x);
      h = Math.min(h, CANVAS_H - y);

      setCrop({ x, y, w, h });
      return;
    }

    // Déplacement du cadre
    if (isDraggingCrop && cropDragStart.current) {
      const { pos: startPos, crop: startCrop } = cropDragStart.current;
      const dx = pos.x - startPos.x;
      const dy = pos.y - startPos.y;
      const newX = Math.max(0, Math.min(CANVAS_W - startCrop.w, startCrop.x + dx));
      const newY = Math.max(0, Math.min(CANVAS_H - startCrop.h, startCrop.y + dy));
      setCrop({ ...startCrop, x: newX, y: newY });
      return;
    }

    // Déplacement de l'image
    if (isDraggingImg && dragStart.current) {
      setOffset({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  }, [crop, isResizingCrop, isDraggingCrop, isDraggingImg, getCanvasPos, aspectRatio]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingImg(false);
    setIsDraggingCrop(false);
    setIsResizingCrop(false);
    dragStart.current = null;
    cropDragStart.current = null;
  }, []);

  // Curseur dynamique
  const getCursor = useCallback((e) => {
    if (!crop || !canvasRef.current) return;
    const pos = getCanvasPos(e);
    const handle = hitHandle(pos.x, pos.y, crop);
    if (handle) {
      const cursors = { tl: 'nwse-resize', br: 'nwse-resize', tr: 'nesw-resize', bl: 'nesw-resize', tc: 'ns-resize', bc: 'ns-resize', ml: 'ew-resize', mr: 'ew-resize' };
      canvasRef.current.style.cursor = cursors[handle] || 'default';
    } else if (insideCrop(pos.x, pos.y, crop)) {
      canvasRef.current.style.cursor = 'move';
    } else {
      canvasRef.current.style.cursor = isDraggingImg ? 'grabbing' : 'grab';
    }
  }, [crop, isDraggingImg, getCanvasPos]);

  // ── Zoom ───────────────────────────────────────────────────────────────────
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setScale(s => Math.max(0.1, Math.min(5, s + delta)));
  }, []);

  const changeZoom = (delta) => {
    setScale(s => Math.max(0.1, Math.min(5, s + delta)));
  };

  const resetView = () => {
    const img = imageRef.current;
    if (!img) return;
    const initScale = Math.max(CANVAS_W / img.naturalWidth, CANVAS_H / img.naturalHeight) * 0.85;
    setScale(initScale);
    setOffset({
      x: (CANVAS_W - img.naturalWidth * initScale) / 2,
      y: (CANVAS_H - img.naturalHeight * initScale) / 2
    });
  };

  // ── Export (canvas -> Blob) ────────────────────────────────────────────────
  const handleConfirm = useCallback(async () => {
    if (!crop || !imageRef.current || uploading) return;
    setUploading(true);

    const img = imageRef.current;
    const scaleX = CANVAS_W / (canvasRef.current?.getBoundingClientRect().width || CANVAS_W);
    const scaleY = CANVAS_H / (canvasRef.current?.getBoundingClientRect().height || CANVAS_H);

    // Coordonnées du crop dans l'espace image naturel
    const srcX = (crop.x - offset.x) / scale;
    const srcY = (crop.y - offset.y) / scale;
    const srcW = crop.w / scale;
    const srcH = crop.h / scale;

    // Canvas de sortie (haute résolution)
    const OUTPUT_W = Math.round(Math.min(srcW, img.naturalWidth) * 2);
    const OUTPUT_H = Math.round(Math.min(srcH, img.naturalHeight) * 2);

    const outCanvas = document.createElement('canvas');
    outCanvas.width = OUTPUT_W;
    outCanvas.height = OUTPUT_H;
    const outCtx = outCanvas.getContext('2d');

    outCtx.drawImage(
      img,
      srcX, srcY, srcW, srcH,
      0, 0, OUTPUT_W, OUTPUT_H
    );

    outCanvas.toBlob((blob) => {
      setUploading(false);
      if (blob) onConfirm(blob);
    }, 'image/jpeg', 0.92);
  }, [crop, offset, scale, onConfirm, uploading]);

  // ── Curseur sur touch/move ─────────────────────────────────────────────────
  const handleMouseMoveFull = useCallback((e) => {
    handleMouseMove(e);
    getCursor(e);
  }, [handleMouseMove, getCursor]);

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        background: '#1e293b',
        borderRadius: '16px',
        padding: '1.5rem',
        width: 'min(760px, 95vw)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        userSelect: 'none',
      }}>
        {/* Titre */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Crop size={18} color="#38bdf8" />
            <span style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '1rem' }}>{label}</span>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Instructions */}
        <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.8rem' }}>
          <strong style={{ color: '#38bdf8' }}>Cadre blanc</strong> = zone recadrée · <strong style={{ color: '#38bdf8' }}>Glisser les poignées</strong> pour redimensionner · <strong style={{ color: '#38bdf8' }}>Cliquer l'intérieur</strong> pour déplacer · <strong style={{ color: '#38bdf8' }}>Molette / boutons</strong> pour zoomer l'image
        </p>

        {/* Canvas */}
        <div ref={containerRef} style={{
          borderRadius: '10px',
          overflow: 'hidden',
          border: '2px solid #334155',
          lineHeight: 0,
          cursor: 'grab',
        }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{ display: 'block', width: '100%', maxHeight: '60vh', objectFit: 'contain' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMoveFull}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
        </div>

        {/* Contrôles du bas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', gap: '1rem' }}>
          {/* Zoom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={() => changeZoom(-0.1)} style={btnStyle} title="Dézoomer"><ZoomOut size={16} color="#cbd5e1" /></button>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', minWidth: '3.5rem', textAlign: 'center' }}>{Math.round(scale * 100)}%</span>
            <button onClick={() => changeZoom(0.1)} style={btnStyle} title="Zoomer"><ZoomIn size={16} color="#cbd5e1" /></button>
            <button onClick={resetView} style={btnStyle} title="Réinitialiser la vue"><RotateCcw size={15} color="#cbd5e1" /></button>
          </div>

          {/* Taille du crop */}
          {crop && (
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
              Sélection : {Math.round(crop.w)} × {Math.round(crop.h)} px
            </span>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={onCancel} style={{
              padding: '0.6rem 1.2rem', borderRadius: '8px',
              background: '#334155', border: 'none', color: '#cbd5e1',
              cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem'
            }}>
              Annuler
            </button>
            <button onClick={handleConfirm} disabled={uploading || !imgLoaded} style={{
              padding: '0.6rem 1.4rem', borderRadius: '8px',
              background: uploading ? '#1e40af' : '#0ea5e9',
              border: 'none', color: '#fff',
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontWeight: '700', fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <Check size={16} />
              {uploading ? 'Traitement...' : 'Valider le recadrage'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  background: '#334155',
  border: 'none',
  borderRadius: '6px',
  padding: '0.4rem 0.6rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
