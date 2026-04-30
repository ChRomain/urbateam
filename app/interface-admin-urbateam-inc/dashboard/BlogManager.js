'use client';

import { useState, useEffect, useRef } from 'react';
import GlassCard from '../../../components/GlassCard';
import { Upload, Trash2, Plus, Save, X, Type, Image as ImageIcon, User, Tag, Layout, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BlogManager() {
  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('URBATEAM');
  const [tags, setTags] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

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
      alert("Veuillez remplir le titre, le résumé court, le contenu et l'image de mise en avant.");
      return;
    }
    setSaving(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('tags', tags);
    formData.append('excerpt', excerpt);
    formData.append('content', content);
    if (featuredImage) formData.append('featuredImage', featuredImage);

    try {
      const res = await fetch('/api/interface-admin-urbateam-inc/blog', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setPosts([data.post, ...posts]);
        setIsEditing(false);
        resetForm();
      }
    } catch (err) {
      alert("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet article ?')) return;
    try {
      await fetch('/api/interface-admin-urbateam-inc/blog', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setPosts(posts.filter(p => p.id !== id));
    } catch (err) {
      alert('Erreur suppression');
    }
  };

  const resetForm = () => {
    setTitle('');
    setAuthor('URBATEAM');
    setTags('');
    setExcerpt('');
    setContent('');
    setFeaturedImage(null);
    setImagePreview(null);
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const [selectedImage, setSelectedImage] = useState(null);

  const addLink = () => {
    const url = prompt('Entrez l\'URL du lien (ex: https://google.com) :');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const changeImageSize = (size) => {
    if (selectedImage) {
      selectedImage.style.width = size;
      setContent(editorRef.current.innerHTML);
    } else {
      // Fallback si rien n'est sélectionné via le clic
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        let node = selection.anchorNode;
        if (node.nodeType === 3) node = node.parentNode;
        const img = node.tagName === 'IMG' ? node : node.querySelector('img');
        if (img) {
          img.style.width = size;
          setContent(editorRef.current.innerHTML);
          return;
        }
      }
      alert("Cliquez d'abord sur l'image (elle doit s'entourer d'un cadre) pour la redimensionner.");
    }
  };

  const handleEditorClick = (e) => {
    if (e.target.tagName === 'IMG') {
      // Retirer la bordure de l'ancienne image sélectionnée
      if (selectedImage) selectedImage.style.outline = 'none';
      
      // Sélectionner la nouvelle
      const img = e.target;
      img.style.outline = '3px solid var(--primary-color)';
      img.style.outlineOffset = '2px';
      setSelectedImage(img);
    } else {
      if (selectedImage) selectedImage.style.outline = 'none';
      setSelectedImage(null);
    }
  };

  const insertImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    // Sauvegarder la sélection actuelle
    const selection = window.getSelection();
    let range = null;
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    }

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/interface-admin-urbateam-inc/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        
        if (data.success) {
          if (editorRef.current) {
            editorRef.current.focus();
            
            // Créer l'élément image
            const img = document.createElement('img');
            img.src = data.url;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.margin = '1.5rem 0';
            img.style.borderRadius = '12px';
            img.style.display = 'block';
            img.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';

            // Créer un paragraphe vide après
            const p = document.createElement('p');
            p.innerHTML = '<br>';

            // Insérer à la position du curseur
            if (range) {
              range.deleteContents();
              range.insertNode(p);
              range.insertNode(img);
              
              // Déplacer le curseur après l'image
              const newRange = document.createRange();
              newRange.setStartAfter(p);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
            } else {
              editorRef.current.appendChild(img);
              editorRef.current.appendChild(p);
            }
            
            setContent(editorRef.current.innerHTML);
          }
        } else {
          alert("Erreur serveur : " + (data.message || "Impossible d'uploader l'image"));
        }
      } catch (err) {
        alert("Erreur réseau : Impossible de contacter le serveur d'upload");
      }
    };
    input.click();
  };

  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary-color)' }}>Gestion du Blog</h2>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {isEditing ? <><X size={18} /> Annuler</> : <><Plus size={18} /> Nouvel Article</>}
        </button>
      </div>

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
                    <div>
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

                  {/* Right Column: Featured Image */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700' }}>Image de mise en avant <span style={{ color: '#ef4444' }}>*</span></label>
                    <div 
                      onClick={() => fileInputRef.current.click()}
                      style={{ 
                        border: '2px dashed #cbd5e1', 
                        borderRadius: '12px', 
                        height: '280px',
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
                          <ImageIcon size={48} style={{ marginBottom: '1rem' }} />
                          <p>Cliquez pour ajouter l'image principale</p>
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
                    </div>
                  </div>
                </div>

                {/* Rich Text Editor */}
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '700' }}>Contenu de l'article</label>
                  
                  {/* Toolbar */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    padding: '0.5rem', 
                    backgroundColor: '#f1f5f9', 
                    border: '1px solid #e2e8f0',
                    borderBottom: 'none',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                    flexWrap: 'wrap'
                  }}>
                    <button type="button" onClick={() => execCommand('bold')} style={{ padding: '0.5rem 0.8rem', fontWeight: 'bold', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white' }}>B</button>
                    <button type="button" onClick={() => execCommand('italic')} style={{ padding: '0.5rem 0.8rem', fontStyle: 'italic', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white' }}>I</button>
                    <button type="button" onClick={() => execCommand('underline')} style={{ padding: '0.5rem 0.8rem', textDecoration: 'underline', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white' }}>U</button>
                    <button type="button" onClick={addLink} style={{ padding: '0.5rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white', marginLeft: '0.5rem' }} title="Ajouter un lien">
                      <LinkIcon size={16} />
                    </button>
                    
                    {/* Color Picker */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', border: '1px solid #cbd5e1', padding: '0.2rem', borderRadius: '4px', background: 'white', marginLeft: '0.5rem' }}>
                      <button type="button" onClick={() => execCommand('foreColor', '#79a081')} style={{ width: '20px', height: '20px', backgroundColor: '#79a081', border: 'none', borderRadius: '2px', cursor: 'pointer' }} title="Vert Urbateam" />
                      <button type="button" onClick={() => execCommand('foreColor', '#3c3c3c')} style={{ width: '20px', height: '20px', backgroundColor: '#3c3c3c', border: 'none', borderRadius: '2px', cursor: 'pointer' }} title="Gris foncé" />
                      <button type="button" onClick={() => execCommand('foreColor', '#d6b99f')} style={{ width: '20px', height: '20px', backgroundColor: '#d6b99f', border: 'none', borderRadius: '2px', cursor: 'pointer' }} title="Kraft" />
                      <input 
                        type="color" 
                        onChange={(e) => execCommand('foreColor', e.target.value)}
                        style={{ width: '24px', height: '24px', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                        title="Couleur personnalisée"
                      />
                    </div>

                    <div style={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1', margin: '0 0.5rem' }} />
                    <button type="button" onClick={() => execCommand('formatBlock', '<h1>')} style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white' }}>H1</button>
                    <button type="button" onClick={() => execCommand('formatBlock', '<h2>')} style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white' }}>H2</button>
                    <button type="button" onClick={() => execCommand('formatBlock', 'p')} style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white' }}>Paragraphe</button>
                    <div style={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1', margin: '0 0.5rem' }} />
                    <button type="button" onClick={() => execCommand('justifyLeft')} style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white' }}>Gauche</button>
                    <button type="button" onClick={() => execCommand('justifyCenter')} style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white' }}>Centre</button>
                    <button type="button" onClick={() => execCommand('insertUnorderedList')} style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white' }}>Liste</button>
                    <div style={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1', margin: '0 0.5rem' }} />
                    <button type="button" onClick={insertImage} style={{ 
                      padding: '0.5rem 1rem', 
                      border: '1px solid var(--primary-color)', 
                      borderRadius: '4px', 
                      background: 'white',
                      color: 'var(--primary-color)',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <ImageIcon size={16} /> Image
                    </button>
                    <div style={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden', marginLeft: '0.5rem', alignItems: 'center' }}>
                      <button type="button" onClick={() => changeImageSize('30%')} style={{ padding: '0.5rem', background: 'white', border: 'none', borderRight: '1px solid #cbd5e1', fontSize: '0.7rem' }}>S</button>
                      <button type="button" onClick={() => changeImageSize('60%')} style={{ padding: '0.5rem', background: 'white', border: 'none', borderRight: '1px solid #cbd5e1', fontSize: '0.7rem' }}>M</button>
                      <button type="button" onClick={() => changeImageSize('100%')} style={{ padding: '0.5rem', background: 'white', border: 'none', borderRight: '1px solid #cbd5e1', fontSize: '0.7rem' }}>L</button>
                      <input 
                        type="number" 
                        placeholder="%" 
                        onChange={(e) => changeImageSize(e.target.value + '%')}
                        style={{ width: '45px', border: 'none', padding: '0 0.5rem', fontSize: '0.7rem', outline: 'none' }} 
                      />
                      <span style={{ fontSize: '0.7rem', paddingRight: '0.5rem', backgroundColor: 'white', color: '#64748b' }}>%</span>
                    </div>
                  </div>

                  {/* Editable Area */}
                  <div 
                    ref={editorRef}
                    contentEditable
                    onInput={(e) => setContent(e.currentTarget.innerHTML)}
                    onClick={handleEditorClick}
                    style={{ 
                      minHeight: '400px', 
                      padding: '1.5rem', 
                      border: '1px solid #e2e8f0', 
                      borderBottomLeftRadius: '8px',
                      borderBottomRightRadius: '8px',
                      backgroundColor: 'white',
                      outline: 'none',
                      fontSize: '1.1rem',
                      lineHeight: '1.6'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn" style={{ border: '1px solid #cbd5e1' }}>Annuler</button>
                  <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2rem' }}>
                    <Save size={18} /> {saving ? 'Enregistrement...' : 'Publier l\'article'}
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
          posts.map(post => (
            <GlassCard key={post.id} style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f1f5f9' }}>
                <img src={post.featuredImage || '/placeholder-blog.jpg'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flexGrow: 1 }}>
                <h3 style={{ marginBottom: '0.2rem', fontSize: '1.1rem' }}>{post.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Par {post.author} le {new Date(post.date).toLocaleDateString()}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleDelete(post.id)} style={{ padding: '0.6rem', color: '#ef4444', backgroundColor: '#fee2e2', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
