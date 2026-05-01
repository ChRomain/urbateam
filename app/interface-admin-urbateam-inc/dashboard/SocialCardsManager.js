'use client';

import { useState, useRef, useEffect } from 'react';
import GlassCard from '../../../components/GlassCard';
import { Download, Share2, Type, Image as ImageIcon, Layout, Move, Maximize, X } from 'lucide-react';
import { useToast } from './ToastContext';
import { useTheme } from './ThemeContext';

const FORMATS = {
  STORY: { name: 'Story Instagram (9:16)', width: 1080, height: 1920, ratio: 9/16 },
  POST: { name: 'Post LinkedIn / Insta (4:5)', width: 1080, height: 1350, ratio: 4/5 },
  SQUARE: { name: 'Carré (1:1)', width: 1080, height: 1080, ratio: 1/1 }
};

const LOGO_POSITIONS = {
  TOP_LEFT: 'Haut Gauche',
  TOP_RIGHT: 'Haut Droite',
  BOTTOM_LEFT: 'Bas Gauche',
  BOTTOM_RIGHT: 'Bas Droite'
};

export default function SocialCardsManager() {
  const { showToast } = useToast();
  const { colors } = useTheme();
  
  const [format, setFormat] = useState('POST');
  const [bgImage, setBgImage] = useState(null);
  const [logoPos, setLogoPos] = useState('BOTTOM_RIGHT');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [overlayOpacity, setOverlayOpacity] = useState(0.3);
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    drawCanvas();
  }, [format, bgImage, logoPos, title, subtitle, overlayOpacity]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => setBgImage(img);
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const f = FORMATS[format];
    
    // Set internal resolution
    canvas.width = f.width;
    canvas.height = f.height;

    // 1. Draw Background
    if (bgImage) {
      const scale = Math.max(canvas.width / bgImage.width, canvas.height / bgImage.height);
      const x = (canvas.width / 2) - (bgImage.width / 2) * scale;
      const y = (canvas.height / 2) - (bgImage.height / 2) * scale;
      ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale);
    } else {
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '40px Montserrat';
      ctx.textAlign = 'center';
      ctx.fillText('Sélectionnez une image', canvas.width / 2, canvas.height / 2);
    }

    // 2. Dark Overlay (Gradient for better text readability)
    const gradient = ctx.createLinearGradient(0, canvas.height * 0.5, 0, canvas.height);
    gradient.addColorStop(0, `rgba(0,0,0,0)`);
    gradient.addColorStop(1, `rgba(0,0,0,${overlayOpacity + 0.4})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Draw Logo (Simulated Logo with Text)
    const padding = 60;
    const logoW = 350;
    const logoH = 100;
    let lx, ly;

    switch(logoPos) {
      case 'TOP_LEFT': lx = padding; ly = padding; break;
      case 'TOP_RIGHT': lx = canvas.width - logoW - padding; ly = padding; break;
      case 'BOTTOM_LEFT': lx = padding; ly = canvas.height - logoH - padding; break;
      case 'BOTTOM_RIGHT': lx = canvas.width - logoW - padding; ly = canvas.height - logoH - padding; break;
    }

    // Logo Background (Blurry Glass)
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.roundRect(lx, ly, logoW, logoH, 20);
    ctx.fill();
    
    // Logo Text
    ctx.font = 'bold 45px Righteous';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    const textX = lx + 30;
    const textY = ly + logoH / 2;
    
    ctx.fillStyle = '#79a081'; // Primary
    ctx.fillText('URBA', textX, textY);
    const urbaWidth = ctx.measureText('URBA').width;
    ctx.fillStyle = '#d6b99f'; // Accent
    ctx.fillText('team', textX + urbaWidth, textY);
    ctx.restore();

    // 4. Draw Title & Subtitle
    if (title) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 15;
      ctx.fillStyle = 'white';
      ctx.font = 'bold 80px Montserrat';
      ctx.textAlign = 'center';
      
      const titleY = canvas.height * 0.8;
      ctx.fillText(title.toUpperCase(), canvas.width / 2, titleY);
      
      if (subtitle) {
        ctx.font = '400 40px Montserrat';
        ctx.fillText(subtitle, canvas.width / 2, titleY + 60);
      }
      ctx.restore();
    }
  };

  const download = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `social-card-urbateam-${format.toLowerCase()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
    showToast("Carte sociale téléchargée !");
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2.5rem' }}>
      {/* Preview Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ 
          width: '100%', 
          maxHeight: '70vh', 
          display: 'flex', 
          justifyContent: 'center', 
          backgroundColor: '#0f172a', 
          borderRadius: '24px', 
          padding: '2rem',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)'
        }}>
          <canvas 
            ref={canvasRef} 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              height: 'auto', 
              borderRadius: '8px',
              boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
            }} 
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={download} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem 2rem' }}>
            <Download size={20} /> Télécharger la carte
          </button>
        </div>
      </div>

      {/* Controls Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <GlassCard style={{ padding: '1.5rem' }}>
          <h4 style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Layout size={18} color="var(--primary-color)" /> Format & Image
          </h4>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>Format</label>
            <select 
              value={format} 
              onChange={(e) => setFormat(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
            >
              {Object.entries(FORMATS).map(([key, val]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>Image de fond</label>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <button 
              onClick={() => fileInputRef.current.click()}
              className="btn"
              style={{ width: '100%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}
            >
              <ImageIcon size={18} /> {bgImage ? 'Changer d\'image' : 'Sélectionner une photo'}
            </button>
          </div>
        </GlassCard>

        <GlassCard style={{ padding: '1.5rem' }}>
          <h4 style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Type size={18} color="var(--primary-color)" /> Texte & Overlay
          </h4>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>Titre (Majuscules auto)</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: NOUVEAU PROJET"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>Sous-titre</label>
            <input 
              type="text" 
              value={subtitle} 
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ex: Saint-Renan (29)"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
            />
          </div>

          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Opacité de l'ombre <span>{Math.round(overlayOpacity * 100)}%</span>
            </label>
            <input 
              type="range" 
              min="0" 
              max="0.8" 
              step="0.05"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </GlassCard>

        <GlassCard style={{ padding: '1.5rem' }}>
          <h4 style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Move size={18} color="var(--primary-color)" /> Position du Logo
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {Object.entries(LOGO_POSITIONS).map(([key, val]) => (
              <button 
                key={key}
                onClick={() => setLogoPos(key)}
                className="btn"
                style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.6rem',
                  backgroundColor: logoPos === key ? 'var(--primary-color)' : '#f1f5f9',
                  color: logoPos === key ? 'white' : '#64748b',
                  border: 'none'
                }}
              >
                {val}
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
