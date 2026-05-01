'use client';

import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import GlassCard from '../../../components/GlassCard';
import { Download, Printer, Copy, Check, RefreshCw, QrCode } from 'lucide-react';
import { useToast } from './ToastContext';
import { useTheme } from './ThemeContext';

export default function QRCodeManager() {
  const { showToast } = useToast();
  const { colors, darkMode } = useTheme();
  
  const [url, setUrl] = useState('https://urbateam.fr');
  const [qrColor, setQrColor] = useState('#004a44'); // Vert Urbateam par défaut
  const [bgColor, setBgColor] = useState('#ffffff');
  const [qrSize, setQrSize] = useState(500);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  const downloadPNG = () => {
    const canvas = qrRef.current.querySelector('canvas');
    const image = canvas.toDataURL("image/png");
    const link = document.createElement('a');
    link.href = image;
    link.download = `qrcode-urbateam-${qrColor}.png`;
    link.click();
    showToast("QR Code téléchargé (PNG)");
  };

  const downloadPDF = () => {
    const canvas = qrRef.current.querySelector('canvas');
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    // Centrer le QR code sur la page A4
    const x = (pdfWidth - 100) / 2;
    const y = 50;
    
    pdf.setFontSize(20);
    pdf.setTextColor(qrColor);
    pdf.text("URBATEAM", pdfWidth / 2, 30, { align: 'center' });
    
    pdf.addImage(imgData, 'PNG', x, y, 100, 100);
    
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(url, pdfWidth / 2, 160, { align: 'center' });
    
    pdf.save(`qrcode-urbateam-${qrColor}.pdf`);
    showToast("QR Code téléchargé (PDF)");
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast("Lien copié !");
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2.5rem', alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <GlassCard style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div ref={qrRef} style={{ 
            padding: '2rem', 
            backgroundColor: 'white', 
            borderRadius: '20px', 
            display: 'inline-block',
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            <QRCodeCanvas
              value={url}
              size={256}
              fgColor={qrColor}
              bgColor={bgColor}
              level="H"
              includeMargin={false}
            />
          </div>
          
          <h3 style={{ fontSize: '1.5rem', color: colors.text, marginBottom: '1rem' }}>Scannez-moi</h3>
          <p style={{ color: colors.textMuted, marginBottom: '2rem' }}>Ce QR Code renvoie vers : <strong style={{ color: 'var(--primary-color)' }}>{url}</strong></p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={downloadPNG} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.5rem' }}>
              <Download size={18} /> PNG
            </button>
            <button onClick={downloadPDF} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.5rem', border: '1px solid #e2e8f0' }}>
              <Printer size={18} /> PDF
            </button>
          </div>
        </GlassCard>
        
        <GlassCard style={{ padding: '2rem' }}>
          <h4 style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <QrCode size={20} color="var(--primary-color)" /> Configuration du lien
          </h4>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{ 
                flex: 1, 
                padding: '0.8rem', 
                borderRadius: '10px', 
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.input,
                color: colors.text
              }}
            />
            <button onClick={copyUrl} style={{ padding: '0.8rem', borderRadius: '10px', border: 'none', backgroundColor: '#f1f5f9', cursor: 'pointer' }}>
              {copied ? <Check size={18} color="#22c55e" /> : <Copy size={18} />}
            </button>
          </div>
        </GlassCard>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <GlassCard style={{ padding: '2rem' }}>
          <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Personnalisation</h4>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: colors.textMuted, marginBottom: '0.6rem' }}>Couleur du QR Code</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input 
                type="color" 
                value={qrColor}
                onChange={(e) => setQrColor(e.target.value)}
                style={{ width: '50px', height: '50px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0, backgroundColor: 'transparent' }}
              />
              <input 
                type="text" 
                value={qrColor}
                onChange={(e) => setQrColor(e.target.value)}
                style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: colors.textMuted, marginBottom: '0.6rem' }}>Couleur de fond</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input 
                type="color" 
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                style={{ width: '50px', height: '50px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0, backgroundColor: 'transparent' }}
              />
              <input 
                type="text" 
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: colors.textMuted, lineHeight: '1.5' }}>
              Conseil : Assurez-vous que le contraste entre les deux couleurs soit suffisant pour une lecture optimale par les smartphones.
            </p>
          </div>
        </GlassCard>

        <button 
          onClick={() => { setQrColor('#004a44'); setBgColor('#ffffff'); setUrl('https://urbateam.fr'); }}
          className="btn" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'center', backgroundColor: 'transparent', border: '1px solid #e2e8f0', color: colors.textMuted }}
        >
          <RefreshCw size={16} /> Réinitialiser
        </button>
      </div>
    </div>
  );
}
