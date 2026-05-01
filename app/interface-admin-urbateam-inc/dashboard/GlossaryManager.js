'use client';

import { useState, useEffect } from 'react';
import GlassCard from '../../../components/GlassCard';
import { Save, Plus, Trash2, Book, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlossaryManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState('fr');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGlossary();
  }, []);

  const fetchGlossary = async () => {
    try {
      const res = await fetch('/api/interface-admin-urbateam-inc/glossary');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error('Erreur Lexique');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/interface-admin-urbateam-inc/glossary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Lexique mis à jour avec succès !');
      }
    } catch (err) {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      fr: { term: '', definition: '' },
      en: { term: '', definition: '' },
      br: { term: '', definition: '' }
    };
    setItems([newItem, ...items]);
    setSearchTerm(''); // On vide la recherche pour voir le nouvel item
  };

  const removeItem = (id) => {
    if (confirm('Supprimer ce terme ?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id, lang, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          [lang]: { ...item[lang], [field]: value }
        };
      }
      return item;
    }));
  };

  const filteredItems = items.filter(item => {
    const term = item[activeLang]?.term?.toLowerCase() || '';
    const def = item[activeLang]?.definition?.toLowerCase() || '';
    return term.includes(searchTerm.toLowerCase()) || def.includes(searchTerm.toLowerCase());
  }).sort((a, b) => (a[activeLang]?.term || '').localeCompare(b[activeLang]?.term || ''));

  if (loading) return <p>Chargement du lexique...</p>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Gestion du Lexique</h2>
          <p style={{ color: '#64748b' }}>Gérez les termes techniques et leurs définitions.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={addItem}
            className="btn"
            style={{ 
              backgroundColor: '#f1f5f9', 
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={18} /> Nouveau terme
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Save size={18} /> {saving ? 'Enregistrement...' : 'Enregistrer tout'}
          </button>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '1.5rem', 
        marginBottom: '2rem',
        alignItems: 'center'
      }}>
        {/* Sélecteur de langue */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          backgroundColor: '#f1f5f9',
          padding: '0.4rem',
          borderRadius: '12px',
          width: 'fit-content'
        }}>
          {['fr', 'en', 'br'].map(lang => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeLang === lang ? '#fff' : 'transparent',
                color: activeLang === lang ? '#0f172a' : '#64748b',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Barre de recherche locale */}
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text"
            placeholder="Rechercher un terme dans la liste..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.8rem 1rem 0.8rem 2.8rem', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0',
              fontSize: '0.95rem'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <AnimatePresence>
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GlassCard style={{ padding: '1.2rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'start' }}>
                  <div style={{ flex: '0 0 250px' }}>
                    <input 
                      type="text"
                      value={item[activeLang]?.term || ''}
                      onChange={(e) => updateItem(item.id, activeLang, 'term', e.target.value)}
                      placeholder="Terme..."
                      style={{ 
                        width: '100%', 
                        padding: '0.6rem', 
                        borderRadius: '6px', 
                        border: '1px solid #e2e8f0',
                        fontWeight: '700',
                        fontSize: '1rem',
                        color: 'var(--secondary-color)'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <textarea 
                      value={item[activeLang]?.definition || ''}
                      onChange={(e) => updateItem(item.id, activeLang, 'definition', e.target.value)}
                      placeholder="Définition..."
                      style={{ 
                        width: '100%', 
                        padding: '0.6rem', 
                        borderRadius: '6px', 
                        border: '1px solid #e2e8f0',
                        minHeight: '60px',
                        fontFamily: 'inherit',
                        fontSize: '0.9rem',
                        lineHeight: '1.4',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    style={{ 
                      backgroundColor: '#fee2e2', 
                      color: '#ef4444', 
                      border: 'none', 
                      padding: '0.5rem', 
                      borderRadius: '6px', 
                      cursor: 'pointer' 
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
            <Book size={40} style={{ marginBottom: '1rem' }} />
            <p>Aucun terme trouvé.</p>
          </div>
        )}
      </div>
    </div>
  );
}
