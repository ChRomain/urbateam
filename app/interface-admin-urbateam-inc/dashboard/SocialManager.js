'use client';

import { useState, useEffect, useRef } from 'react';
import GlassCard from '../../../components/GlassCard';
import { Upload, Trash2, Image as ImageIcon, Edit, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './ToastContext';
import { useTheme } from './ThemeContext';

export default function SocialManager() {
  const { showToast } = useToast();
  const { colors, darkMode } = useTheme();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('terrain');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Tous');
  const [editingId, setEditingId] = useState(null);
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
    formData.append('category', category);
    if (editingId) formData.append('id', editingId);

    try {
      const res = await fetch('/api/interface-admin-urbateam-inc/social', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        if (editingId) {
          setPosts(posts.map(p => p.id === editingId ? data.post : p));
          showToast("Photo mise à jour !");
        } else {
          setPosts([data.post, ...posts]);
          showToast("Photo ajoutée avec succès !");
        }
        resetForm();
      }
    } catch (err) {
      showToast("Erreur lors de l'envoi de la photo", "error");
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
      showToast("Photo supprimée.", "success");
    } catch (err) {
      showToast("Erreur lors de la suppression", "error");
    }
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setCaption(post.caption || '');
    setCategory(post.category || 'terrain');
    setPreview(post.url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setCaption('');
    setCategory('terrain');
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          {editingId ? 'Modifier la photo' : 'Ajouter une photo'}
        </h2>
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

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Catégorie</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              >
                <option value="terrain">Terrain</option>
                <option value="expertise">Expertise</option>
                <option value="equipe">Équipe</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              {editingId && (
                <button type="button" onClick={resetForm} className="btn" style={{ flex: 1, border: '1px solid #cbd5e1' }}>
                  <X size={18} />
                </button>
              )}
              <button type="submit" disabled={uploading || (!preview && !editingId)} className="btn btn-primary" style={{ flex: 3, padding: '1rem' }}>
                {uploading ? 'Envoi...' : editingId ? 'Mettre à jour' : 'Publier sur le site'}
              </button>
            </div>
          </form>
        </GlassCard>
      </div>

      {/* Flux */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: colors.text }}>Flux actuel ({posts.length} photos)</h2>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <input 
              type="text" 
              placeholder="Chercher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
            />
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
            >
              <option value="Tous">Tous</option>
              <option value="terrain">Terrain</option>
              <option value="expertise">Expertise</option>
              <option value="equipe">Équipe</option>
            </select>
          </div>
        </div>
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
            <AnimatePresence>
              {posts
                .filter(post => {
                  const matchesSearch = (post.caption || '').toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesCat = filterCategory === 'Tous' || post.category === filterCategory;
                  return matchesSearch && matchesCat;
                })
                .map((post) => (
                  <motion.div key={post.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <GlassCard style={{ padding: '0.8rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ width: '100%', height: '150px', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.8rem' }}>
                        <img src={post.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.2rem' }}>{post.caption || '(Sans légende)'}</p>
                          <span style={{ fontSize: '0.65rem', backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>#{post.category || 'non-classé'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          <button onClick={() => handleEdit(post)} style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary-color)', border: 'none', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }}>
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDelete(post.id)} style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
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
