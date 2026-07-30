'use client';

import { useState, useEffect } from 'react';
import GlassCard from '../../../components/GlassCard';
import { Save, Plus, Trash2, ChevronUp, ChevronDown, Star, MessageSquare, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './ToastContext';
import { useTheme } from './ThemeContext';

export default function AvisManager() {
  const { showToast } = useToast();
  const { colors, darkMode } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/admin/testimonials');
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des avis:', err);
      showToast('Erreur lors du chargement des avis', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Les avis Google ont été enregistrés avec succès !', 'success');
        if (data.items) {
          setItems(data.items);
        }
      } else {
        showToast('Erreur lors de la sauvegarde : ' + (data.error || 'Erreur inconnue'), 'error');
      }
    } catch (err) {
      showToast('Erreur de connexion lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    const newItem = {
      id: Date.now().toString(),
      name: '',
      location: '',
      text: '',
      rating: 5
    };
    setItems(prev => [newItem, ...prev]);
    showToast('Nouvel avis ajouté au formulaire', 'info');
  };

  const removeItem = (index) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return;
    setItems(prev => prev.filter((_, i) => i !== index));
    showToast('Avis supprimé', 'info');
  };

  const moveItem = (index, direction) => {
    const newItems = [...items];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setItems(newItems);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setItems(newItems);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: colors.textMuted }}>
        <RefreshCw size={28} className="spin" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Actions Bar */}
      <GlassCard style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: colors.text, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={22} color="var(--primary-color)" />
            Gestion des Avis Google ({items.length})
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: colors.textMuted }}>
            Ajoutez, modifiez ou supprimez les avis affichés sur le site. En cas de plus de 3 avis, 3 avis sont tirés aléatoirement à chaque visite.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button
            onClick={addItem}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'rgba(121, 160, 129, 0.15)',
              color: 'var(--primary-color)',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Plus size={18} />
            Ajouter un avis
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(121, 160, 129, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <Save size={18} />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </GlassCard>

      {/* Items List */}
      {items.length === 0 ? (
        <GlassCard style={{ padding: '3rem', textAlign: 'center', color: colors.textMuted }}>
          <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Aucun avis enregistré pour le moment.</p>
          <p style={{ margin: '0.5rem 0 1.5rem 0', fontSize: '0.85rem' }}>Cliquez sur "Ajouter un avis" pour en créer un.</p>
          <button
            onClick={addItem}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            + Ajouter un avis
          </button>
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <GlassCard style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                  {/* Item Toolbar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`, paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ 
                        backgroundColor: 'var(--primary-color)', 
                        color: 'white', 
                        fontSize: '0.75rem', 
                        fontWeight: '700', 
                        borderRadius: '50%', 
                        width: '24px', 
                        height: '24px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        {index + 1}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: colors.text }}>
                        {item.name || 'Nouvel avis Google'}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        onClick={() => moveItem(index, -1)}
                        disabled={index === 0}
                        title="Monter"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: index === 0 ? '#cbd5e1' : colors.textMuted,
                          cursor: index === 0 ? 'default' : 'pointer',
                          padding: '4px',
                          borderRadius: '4px'
                        }}
                      >
                        <ChevronUp size={18} />
                      </button>
                      <button
                        onClick={() => moveItem(index, 1)}
                        disabled={index === items.length - 1}
                        title="Descendre"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: index === items.length - 1 ? '#cbd5e1' : colors.textMuted,
                          cursor: index === items.length - 1 ? 'default' : 'pointer',
                          padding: '4px',
                          borderRadius: '4px'
                        }}
                      >
                        <ChevronDown size={18} />
                      </button>
                      <button
                        onClick={() => removeItem(index)}
                        title="Supprimer cet avis"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          marginLeft: '0.5rem'
                        }}
                      >
                        <Trash2 size={15} />
                        Supprimer
                      </button>
                    </div>
                  </div>

                  {/* Item Inputs Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: colors.textMuted, marginBottom: '0.35rem' }}>
                        Nom du client *
                      </label>
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        placeholder="Ex: Jean-Luc Charles"
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.8rem',
                          borderRadius: '8px',
                          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
                          backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'white',
                          color: colors.text,
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: colors.textMuted, marginBottom: '0.35rem' }}>
                        Ville / Localisation
                      </label>
                      <input
                        type="text"
                        value={item.location || ''}
                        onChange={(e) => updateItem(index, 'location', e.target.value)}
                        placeholder="Ex: Plouézec (22)"
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.8rem',
                          borderRadius: '8px',
                          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
                          backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'white',
                          color: colors.text,
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: colors.textMuted, marginBottom: '0.35rem' }}>
                        Note (1 à 5 ★)
                      </label>
                      <select
                        value={item.rating || 5}
                        onChange={(e) => updateItem(index, 'rating', Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.8rem',
                          borderRadius: '8px',
                          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
                          backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'white',
                          color: colors.text,
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}
                      >
                        <option value={5}>5 ★★★★★</option>
                        <option value={4}>4 ★★★★☆</option>
                        <option value={3}>3 ★★★☆☆</option>
                        <option value={2}>2 ★★☆☆☆</option>
                        <option value={1}>1 ★☆☆☆☆</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: colors.textMuted, marginBottom: '0.35rem' }}>
                      Texte de l'avis *
                    </label>
                    <textarea
                      rows={3}
                      value={item.text || ''}
                      onChange={(e) => updateItem(index, 'text', e.target.value)}
                      placeholder="Rédigez ou collez ici l'avis laissé par le client..."
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
                        backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'white',
                        color: colors.text,
                        fontSize: '0.9rem',
                        fontFamily: 'inherit',
                        lineHeight: '1.4'
                      }}
                    />
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
