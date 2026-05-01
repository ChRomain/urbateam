'use client';

import { useState, useEffect } from 'react';
import GlassCard from '../../../components/GlassCard';
import { Save, Plus, Trash2, ChevronUp, ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState('fr');

  useEffect(() => {
    fetchFaq();
  }, []);

  const fetchFaq = async () => {
    try {
      const res = await fetch('/api/interface-admin-urbateam-inc/faq');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error('Erreur FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/interface-admin-urbateam-inc/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (data.success) {
        alert('FAQ mise à jour avec succès !');
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
      fr: { question: '', answer: '' },
      en: { question: '', answer: '' },
      br: { question: '', answer: '' }
    };
    setItems([newItem, ...items]);
  };

  const removeItem = (id) => {
    if (confirm('Supprimer cette question ?')) {
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

  const moveItem = (index, direction) => {
    const newItems = [...items];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setItems(newItems);
  };

  if (loading) return <p>Chargement de la FAQ...</p>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Gestion de la FAQ</h2>
          <p style={{ color: '#64748b' }}>Gérez les questions fréquentes affichées sur le site.</p>
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
            <Plus size={18} /> Nouvelle question
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

      {/* Sélecteur de langue */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '2rem',
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
              boxShadow: activeLang === lang ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <GlassCard style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  {/* Contrôles de position */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.5rem',
                    paddingRight: '1rem',
                    borderRight: '1px solid #e2e8f0'
                  }}>
                    <button 
                      onClick={() => moveItem(index, -1)}
                      disabled={index === 0}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: index === 0 ? '#cbd5e1' : '#64748b' }}
                    >
                      <ChevronUp size={20} />
                    </button>
                    <div style={{ textAlign: 'center', fontWeight: '700', color: '#94a3b8' }}>{index + 1}</div>
                    <button 
                      onClick={() => moveItem(index, 1)}
                      disabled={index === items.length - 1}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: index === items.length - 1 ? '#cbd5e1' : '#64748b' }}
                    >
                      <ChevronDown size={20} />
                    </button>
                  </div>

                  {/* Champs d'édition */}
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                        Question ({activeLang.toUpperCase()})
                      </label>
                      <input 
                        type="text"
                        value={item[activeLang]?.question || ''}
                        onChange={(e) => updateItem(item.id, activeLang, 'question', e.target.value)}
                        placeholder="Ex: Le bornage est-il obligatoire ?"
                        style={{ 
                          width: '100%', 
                          padding: '0.8rem', 
                          borderRadius: '8px', 
                          border: '1px solid #e2e8f0',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                        Réponse ({activeLang.toUpperCase()})
                      </label>
                      <textarea 
                        value={item[activeLang]?.answer || ''}
                        onChange={(e) => updateItem(item.id, activeLang, 'answer', e.target.value)}
                        placeholder="Votre réponse détaillée ici..."
                        style={{ 
                          width: '100%', 
                          padding: '0.8rem', 
                          borderRadius: '8px', 
                          border: '1px solid #e2e8f0',
                          minHeight: '100px',
                          fontFamily: 'inherit',
                          fontSize: '0.95rem',
                          lineHeight: '1.5'
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ alignSelf: 'flex-start' }}>
                    <button 
                      onClick={() => removeItem(item.id)}
                      style={{ 
                        backgroundColor: '#fee2e2', 
                        color: '#ef4444', 
                        border: 'none', 
                        padding: '0.6rem', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem', 
            backgroundColor: '#f8fafc', 
            borderRadius: '16px',
            border: '2px dashed #e2e8f0'
          }}>
            <HelpCircle size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
            <p style={{ color: '#64748b' }}>Aucune question dans la FAQ pour le moment.</p>
            <button onClick={addItem} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
              Ajouter la première question
            </button>
          </div>
        )}
      </div>

      {/* Aide flottante */}
      <div style={{ marginTop: '3rem', padding: '1.5rem', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
        <p style={{ fontSize: '0.9rem', color: '#1e40af', lineHeight: '1.5' }}>
          <strong>Conseil :</strong> Les FAQ aident énormément au référencement naturel (SEO). Utilisez des mots-clés que vos clients tapent souvent dans Google. Vous pouvez gérer les 3 langues séparément en utilisant le sélecteur en haut de la liste.
        </p>
      </div>
    </div>
  );
}
