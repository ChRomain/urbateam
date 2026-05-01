'use client';

import { useState, useEffect, useRef } from 'react';
import GlassCard from '../../../components/GlassCard';
import { Trash2, Plus, Save, X, Image as ImageIcon, Layout, Search, Edit } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import RichTextEditor from './RichTextEditor';
import SEOPreview from './SEOPreview';
import { useToast } from './ToastContext';
import { useTheme } from './ThemeContext';



export default function BlogManager() {
  const { showToast } = useToast();
  const { colors, darkMode } = useTheme();

  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('URBATEAM');
  const [tags, setTags] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('Tous');
  const fileInputRef = useRef(null);


  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/interface-admin-urbateam-inc/blog');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error('Erreur posts');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title || !excerpt || !content || !featuredImage) {
      showToast("Veuillez remplir le titre, le résumé court, le contenu et l'image de mise en avant.", "error");
      return;
    }
    setSaving(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('tags', tags);
    formData.append('excerpt', excerpt);
    formData.append('content', content);
    if (editingId) formData.append('id', editingId);
    if (featuredImage) formData.append('featuredImage', featuredImage);

    try {
      const res = await fetch('/api/interface-admin-urbateam-inc/blog', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        if (editingId) {
          setPosts(posts.map(p => p.id === editingId ? data.post : p));
          showToast("Article mis à jour !");
        } else {
          setPosts([data.post, ...posts]);
          showToast("Article publié avec succès !");
        }
        setIsEditing(false);
        resetForm();
      }
    } catch (err) {
      showToast("Erreur lors de l'enregistrement", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    // On garde le confirm natif pour la sécurité car c'est une action destructive
    if (!confirm('Supprimer cet article ?')) return;
    try {
      await fetch('/api/interface-admin-urbateam-inc/blog', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setPosts(posts.filter(p => p.id !== id));
      showToast("Article supprimé.", "success");
    } catch (err) {
      showToast("Erreur lors de la suppression", "error");
    }
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setTitle(post.title);
    setAuthor(post.author || 'URBATEAM');
    setTags(post.tags?.join(', ') || '');
    setExcerpt(post.excerpt || '');
    setContent(post.content || '');
    setImagePreview(post.featuredImage);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setAuthor('URBATEAM');
    setTags('');
    setExcerpt('');
    setContent('');
    setFeaturedImage(null);
    setImagePreview(null);
  };


  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: colors.text, fontWeight: '800' }}>{editingId ? 'Modifier l\'article' : 'Gestion du Blog'}</h2>
        <button 
          onClick={() => {
            if (isEditing) resetForm();
            setIsEditing(!isEditing);
          }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {isEditing ? <><X size={18} /> Annuler</> : <><Plus size={18} /> Nouvel Article</>}
        </button>
      </div>

      {/* Search and Filters */}
      {!isEditing && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
          <div style={{ flex: 3, position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Rechercher un article..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.8rem 1rem 0.8rem 2.8rem', 
                borderRadius: '10px', 
                border: `1px solid ${colors.border}`, 
                backgroundColor: colors.input,
                color: colors.text,
                fontSize: '0.95rem'
              }}
            />
            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
              <Search size={18} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <select 
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              style={{ 
                width: '100%',
                padding: '0.8rem', 
                borderRadius: '10px', 
                border: '1px solid #e2e8f0', 
                backgroundColor: 'white',
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              <option value="Tous">Filtrer par tag</option>
              {[...new Set(posts.flatMap(p => p.tags || []))].map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: '3rem' }}
          >
            <GlassCard style={{ padding: '2.5rem' }}>
              <form onSubmit={handleSave}>
                <div className="grid grid-cols-2" style={{ gap: '2rem', marginBottom: '2rem' }}>
                  {/* Left Column: Metadata */}
                  <div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700' }}>Titre de l'article <span style={{ color: '#ef4444' }}>*</span></label>
                      <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Les nouveautés du PLU en 2026"
                        required
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                    </div>
                    <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700' }}>Auteur</label>
                        <input 
                          type="text" 
                          value={author} 
                          onChange={(e) => setAuthor(e.target.value)}
                          style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700' }}>Mots-clés (virgules)</label>
                        <input 
                          type="text" 
                          value={tags} 
                          onChange={(e) => setTags(e.target.value)}
                          placeholder="PLU, Urbanisme, Conseil"
                          style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700' }}>Résumé court (SEO) <span style={{ color: '#ef4444' }}>*</span></label>
                      <textarea 
                        value={excerpt} 
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="Une brève introduction pour la liste des articles..."
                        required
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '100px' }}
                      />
                    </div>
                  </div>

                  {/* SEO Preview & Image */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <SEOPreview 
                      title={title} 
                      excerpt={excerpt} 
                      slug={title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')} 
                    />
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700' }}>Image de mise en avant <span style={{ color: '#ef4444' }}>*</span></label>
                      <div 
                        onClick={() => fileInputRef.current.click()}
                        style={{ 
                          border: '2px dashed #cbd5e1', 
                          borderRadius: '12px', 
                          height: '180px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          backgroundColor: '#f8fafc',
                          overflow: 'hidden'
                        }}
                      >
                        {imagePreview ? (
                          <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ textAlign: 'center', color: '#64748b' }}>
                            <ImageIcon size={40} style={{ marginBottom: '0.5rem' }} />
                            <p style={{ fontSize: '0.8rem' }}>Ajouter l'image principale</p>
                          </div>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Premium Rich Text Editor */}
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '700' }}>Contenu de l'article</label>
                  <RichTextEditor 
                    value={content}
                    onChange={setContent}
                    placeholder="Écrivez votre article ici (sélectionnez une image pour la redimensionner)..."
                    onImageUpload={async (file) => {
                      const formData = new FormData();
                      formData.append('file', file);
                      try {
                        const res = await fetch('/api/interface-admin-urbateam-inc/upload', {
                          method: 'POST',
                          body: formData,
                        });
                        const data = await res.json();
                        return data.success ? data.url : null;
                      } catch (err) {
                        return null;
                      }
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" onClick={() => { setIsEditing(false); resetForm(); }} className="btn" style={{ border: '1px solid #cbd5e1' }}>Annuler</button>
                  <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2rem' }}>
                    <Save size={18} /> {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Publier l\'article'}
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List of articles */}
      <div className="grid grid-cols-1" style={{ gap: '1.5rem' }}>
        {loading ? (
          <p>Chargement des articles...</p>
        ) : posts.length === 0 ? (
          <GlassCard style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <Layout size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>Aucun article publié pour le moment.</p>
          </GlassCard>
        ) : (
          posts
            .filter(post => {
              const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                   post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesTag = filterTag === 'Tous' || (post.tags && post.tags.includes(filterTag));
              return matchesSearch && matchesTag;
            })
            .map(post => (
              <GlassCard key={post.id} style={{ padding: '1.2rem', display: 'flex', gap: '1.5rem', alignItems: 'center', transition: 'transform 0.2s' }}>
                <div style={{ width: '100px', height: '70px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f1f5f9' }}>
                  <img src={post.featuredImage || '/placeholder-blog.jpg'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h3 style={{ marginBottom: '0.2rem', fontSize: '1rem', color: '#0f172a' }}>{post.title}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {post.tags?.map(tag => (
                      <span key={tag} style={{ fontSize: '0.7rem', backgroundColor: 'var(--primary-color)15', color: 'var(--primary-color)', padding: '0.1rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.3rem' }}>
                    Par {post.author} le {new Date(post.date).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(post)} style={{ padding: '0.6rem', color: 'var(--primary-color)', backgroundColor: 'rgba(var(--primary-rgb), 0.1)', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}>
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(post.id)} style={{ padding: '0.6rem', color: '#ef4444', backgroundColor: '#fee2e2', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </GlassCard>
            ))
        )}
      </div>
    </div>
  );
}
