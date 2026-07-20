'use client';

import { useState, useEffect } from 'react';
import GlassCard from '../../../components/GlassCard';
import { useToast } from './ToastContext';
import { useTheme } from './ThemeContext';
import { 
  Save, Plus, Trash2, ChevronUp, ChevronDown, Globe, List
} from 'lucide-react';
import { fr } from '../../../i18n/fr';
import { en } from '../../../i18n/en';
import { br } from '../../../i18n/br';

const defaultTranslations = { fr, en, br };

export default function ProjetsMarquantsManager({ role }) {
  const canEdit = role === 'Administrator' || role === 'Editeur';
  const { showToast } = useToast();
  const { colors } = useTheme();
  const [activeLang, setActiveLang] = useState('fr');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Lists of projects for each language: { fr: [...], en: [...], br: [...] }
  const [projectsList, setProjectsList] = useState({ fr: [], en: [], br: [] });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/admin/texts');
      if (res.ok) {
        const data = await res.json();
        const dbRecord = data.find(item => item.key === 'references.items');

        const lists = { fr: [], en: [], br: [] };
        
        ['fr', 'en', 'br'].forEach(lang => {
          let parsed = null;
          if (dbRecord && dbRecord[lang]) {
            try {
              parsed = JSON.parse(dbRecord[lang]);
            } catch (e) {
              parsed = null;
            }
          }
          // Fallback to static translation if database record is missing or invalid
          if (Array.isArray(parsed)) {
            lists[lang] = parsed;
          } else {
            const staticList = defaultTranslations[lang]?.references?.items;
            lists[lang] = Array.isArray(staticList) ? [...staticList] : [];
          }
        });

        setProjectsList(lists);
      } else {
        showToast('Impossible de charger les projets marquants', 'error');
      }
    } catch (err) {
      console.error('Error fetching projects list:', err);
      showToast('Erreur lors du chargement des projets marquants', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = (lang, index, value) => {
    setProjectsList(prev => {
      const updated = [...prev[lang]];
      updated[index] = value;
      return { ...prev, [lang]: updated };
    });
  };

  const handleAddItem = (lang) => {
    setProjectsList(prev => {
      const updated = [...prev[lang]];
      updated.push('');
      return { ...prev, [lang]: updated };
    });
  };

  const handleDeleteItem = (lang, index) => {
    setProjectsList(prev => {
      const updated = [...prev[lang]];
      updated.splice(index, 1);
      return { ...prev, [lang]: updated };
    });
  };

  const handleMoveUp = (lang, index) => {
    if (index === 0) return;
    setProjectsList(prev => {
      const updated = [...prev[lang]];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      return { ...prev, [lang]: updated };
    });
  };

  const handleMoveDown = (lang, index) => {
    setProjectsList(prev => {
      const updated = [...prev[lang]];
      if (index === updated.length - 1) return prev;
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      return { ...prev, [lang]: updated };
    });
  };

  const handleSave = async () => {
    if (!canEdit) {
      showToast('Vous n\'avez pas les permissions pour modifier ce contenu.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/texts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'references.items',
          fr: JSON.stringify(projectsList.fr),
          en: JSON.stringify(projectsList.en),
          br: JSON.stringify(projectsList.br)
        })
      });

      if (res.ok) {
        showToast('Projets marquants enregistrés avec succès !', 'success');
      } else {
        showToast('Erreur lors de l\'enregistrement des projets marquants.', 'error');
      }
    } catch (err) {
      console.error('Error saving projects list:', err);
      showToast('Erreur de connexion lors de la sauvegarde.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <p style={{ color: colors.textMuted }}>Chargement des projets marquants...</p>
      </div>
    );
  }

  const currentList = projectsList[activeLang] || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header and Language selection */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: '1rem'
      }}>
        
        {/* Language Tabs */}
        <div style={{ 
          display: 'flex', 
          backgroundColor: colors.bg === '#f8fafc' ? '#f1f5f9' : '#2f3136', 
          padding: '0.3rem', 
          borderRadius: '8px',
          gap: '0.2rem'
        }}>
          {['fr', 'en', 'br'].map(lang => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeLang === lang ? (colors.bg === '#f8fafc' ? '#fff' : '#282b30') : 'transparent',
                color: activeLang === lang ? colors.text : colors.textMuted,
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: activeLang === lang ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <Globe size={14} />
              {lang.toUpperCase()} {lang === 'fr' && <span style={{ fontSize: '0.65rem', color: '#3b82f6' }}>(Principal)</span>}
            </button>
          ))}
        </div>

        {/* Global Save Button */}
        {canEdit && (
          <button 
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Save size={18} /> {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
          </button>
        )}
      </div>

      {/* Main List Management Area */}
      <GlassCard style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <List size={22} color="var(--primary-color)" />
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>
            Liste des Projets Marquants ({activeLang.toUpperCase()})
          </h3>
        </div>

        <p style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '1.5rem' }}>
          Ces projets apparaissent dans la section "Nos projets marquants" sur la page d'accueil. Vous pouvez réorganiser l'ordre d'affichage en utilisant les flèches haut/bas.
        </p>

        {currentList.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            border: `2px dashed ${colors.border}`, 
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <p style={{ color: colors.textMuted, margin: 0 }}>Aucun projet marquant configuré pour cette langue.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
            {currentList.map((itemVal, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                alignItems: 'center',
                backgroundColor: colors.bg === '#f8fafc' ? '#f8fafc' : '#282b30',
                padding: '0.5rem 0.8rem',
                borderRadius: '8px',
                border: `1px solid ${colors.border}`
              }}>
                <span style={{ fontSize: '0.85rem', color: colors.textMuted, width: '25px', fontWeight: '600' }}>
                  {idx + 1}.
                </span>
                
                <input 
                  type="text"
                  value={itemVal}
                  disabled={!canEdit}
                  onChange={(e) => handleUpdateItem(activeLang, idx, e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    borderRadius: '6px',
                    border: `1px solid ${colors.border}`,
                    fontSize: '0.9rem',
                    backgroundColor: colors.input,
                    color: colors.text
                  }}
                  placeholder="Ex: Écoquartier de Kervouric-Servel à Lannion..."
                />

                {canEdit && (
                  <div style={{ display: 'flex', gap: '0.2rem' }}>
                    <button 
                      onClick={() => handleMoveUp(activeLang, idx)}
                      disabled={idx === 0}
                      style={{
                        backgroundColor: idx === 0 ? 'transparent' : (colors.bg === '#f8fafc' ? '#e2e8f0' : '#2f3136'),
                        color: idx === 0 ? '#cbd5e1' : colors.text,
                        border: 'none',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        cursor: idx === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex'
                      }}
                      title="Monter"
                    >
                      <ChevronUp size={16} />
                    </button>
                    
                    <button 
                      onClick={() => handleMoveDown(activeLang, idx)}
                      disabled={idx === currentList.length - 1}
                      style={{
                        backgroundColor: idx === currentList.length - 1 ? 'transparent' : (colors.bg === '#f8fafc' ? '#e2e8f0' : '#2f3136'),
                        color: idx === currentList.length - 1 ? '#cbd5e1' : colors.text,
                        border: 'none',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        cursor: idx === currentList.length - 1 ? 'not-allowed' : 'pointer',
                        display: 'flex'
                      }}
                      title="Descendre"
                    >
                      <ChevronDown size={16} />
                    </button>

                    <button 
                      onClick={() => handleDeleteItem(activeLang, idx)}
                      style={{
                        backgroundColor: '#fee2e2',
                        color: '#ef4444',
                        border: 'none',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        marginLeft: '0.5rem'
                      }}
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {canEdit && (
          <button
            onClick={() => handleAddItem(activeLang)}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '8px',
              border: `2px dashed ${colors.border}`,
              backgroundColor: 'transparent',
              color: colors.textMuted,
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <Plus size={18} /> Ajouter un projet marquant
          </button>
        )}
      </GlassCard>
    </div>
  );
}
