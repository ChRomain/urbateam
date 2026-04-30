'use client';

import { useState, useEffect, useRef } from 'react';
import GlassCard from '../../../components/GlassCard';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SocialManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/interface-admin-urbateam-inc/social');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error('Erreur posts');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', caption);

    try {
      const res = await fetch('/api/interface-admin-urbateam-inc/social', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setPosts([data.post, ...posts]);
        setPreview(null);
        setCaption('');
        fileInputRef.current.value = '';
      }
    } catch (err) {
      alert("Erreur upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette photo ?')) return;
    try {
      await fetch('/api/interface-admin-urbateam-inc/social', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setPosts(posts.filter(p => p.id !== id));
    } catch (err) {
      alert('Erreur suppression');
    }
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '320px 1fr', 
      gap: '2.5rem', 
      alignItems: 'start' 
    }}>
      {/* Formulaire d'Upload */}
      <div>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Ajouter une photo</h2>
        <GlassCard style={{ padding: '2rem' }}>
          <form onSubmit={handleUpload}>
            <div 
              onClick={() => fileInputRef.current.click()}
              style={{ 
                border: '2px dashed #cbd5e1', 
                borderRadius: '12px', 
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: '#f1f5f9',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '1.5rem'
              }}
            >
              {preview ? (
                <img src={preview} style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'contain' }} />
              ) : (
                <div style={{ color: '#64748b' }}>
                  <Upload size={32} style={{ marginBottom: '1rem' }} />
                  <p style={{ fontSize: '0.9rem' }}>Cliquez pour sélectionner</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Légende (SEO)</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Ex: Levés topographiques à Brest..."
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>

            <button type="submit" disabled={uploading || !preview} className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
              {uploading ? 'Envoi...' : 'Publier sur le site'}
            </button>
          </form>
        </GlassCard>
      </div>

      {/* Flux */}
      <div style={{ minWidth: 0 }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Flux actuel ({posts.length} photos)</h2>
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
            <AnimatePresence>
              {posts.map((post) => (
                <motion.div key={post.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <GlassCard style={{ padding: '0.8rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ width: '100%', height: '150px', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.8rem' }}>
                      <img src={post.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{post.caption || '(Sans légende)'}</p>
                      <button onClick={() => handleDelete(post.id)} style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
