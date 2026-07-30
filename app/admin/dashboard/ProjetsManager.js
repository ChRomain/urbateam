'use client';

import { useState, useEffect } from 'react';
import GlassCard from '../../../components/GlassCard';
import { 
  LayoutGrid, Trash2, MapPin, Briefcase, Plus, FileText, Edit,
  Search, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Tag
} from 'lucide-react';
import { useToast } from './ToastContext';
import { useTheme } from './ThemeContext';

function evaluateSeoScore({ title = '', location = '', description = '', missions = '' }) {
  const cleanTitle = title.trim();
  const cleanDesc = description.trim();
  const cleanLocation = location.trim();
  const cleanMissions = missions.trim();

  const titleLength = cleanTitle.length;
  const wordsCount = cleanDesc ? cleanDesc.split(/\s+/).filter(Boolean).length : 0;

  const targetKeywords = [
    'brest', 'finistère', 'saint-renan', 'douarnenez', 'landerneau', 'plouzané', 'plouarzel', 'bretagne',
    'géomètre', 'bornage', 'division', 'vrd', 'topographie', 'copropriété', 'lotissement', 'urbanisme', 'assainissement'
  ];

  const fullText = `${cleanTitle} ${cleanLocation} ${cleanDesc} ${cleanMissions}`.toLowerCase();
  const matchedKeywords = targetKeywords.filter(kw => fullText.includes(kw));

  let score = 0;
  const feedback = [];

  // 1. Longueur du titre (Max 25 pts)
  if (titleLength >= 25 && titleLength <= 70) {
    score += 25;
    feedback.push({ type: 'success', text: `Titre bien optimisé (${titleLength} caract.)` });
  } else if (titleLength > 0) {
    score += 12;
    feedback.push({ type: 'warning', text: `Titre ${titleLength < 25 ? 'un peu court' : 'un peu long'} (${titleLength} car., recommandé: 30-65)` });
  } else {
    feedback.push({ type: 'danger', text: 'Titre manquant' });
  }

  // 2. Longueur de la description (Max 35 pts)
  if (wordsCount >= 150) {
    score += 35;
    feedback.push({ type: 'success', text: `Description riche (${wordsCount} mots)` });
  } else if (wordsCount >= 70) {
    score += 22;
    feedback.push({ type: 'warning', text: `Description moyenne (${wordsCount} mots, recommandé: >150 mots)` });
  } else if (wordsCount > 0) {
    score += 10;
    feedback.push({ type: 'danger', text: `Description trop courte (${wordsCount} mots)` });
  } else {
    feedback.push({ type: 'danger', text: 'Description manquante' });
  }

  // 3. Détection de mots-clés SEO (Max 25 pts)
  if (matchedKeywords.length >= 3) {
    score += 25;
    feedback.push({ type: 'success', text: `${matchedKeywords.length} mots-clés découverts (${matchedKeywords.slice(0, 4).join(', ')})` });
  } else if (matchedKeywords.length > 0) {
    score += 12;
    feedback.push({ type: 'warning', text: `Mots-clés limités (${matchedKeywords.join(', ')})` });
  } else {
    feedback.push({ type: 'danger', text: 'Aucun mot-clé SEO détecté (ex: Brest, Bornage, VRD, Géomètre...)' });
  }

  // 4. Localisation (Max 15 pts)
  if (cleanLocation) {
    score += 15;
    feedback.push({ type: 'success', text: `Localisation identifiée (${cleanLocation})` });
  } else {
    feedback.push({ type: 'warning', text: 'Renseignez la commune/ville' });
  }

  return {
    score: Math.min(100, score),
    wordsCount,
    titleLength,
    matchedKeywords,
    feedback
  };
}

export default function ProjetsManager({ role }) {
  const canEdit = role === 'Administrator' || role === 'Editeur';
  const { colors, darkMode } = useTheme();
  const { showToast } = useToast();

  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingProject, setEditingProject] = useState(null);

  const [geocoding, setGeocoding] = useState(false);
  const [uniqueLocations, setUniqueLocations] = useState([]);

  // Category & Subcategory Selector States
  const [selectedCategory, setSelectedCategory] = useState('Urbanisme & Paysage');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [customSubcategory, setCustomSubcategory] = useState('');

  // Controlled form state for live SEO evaluation
  const [formState, setFormState] = useState({
    title: '',
    location: '',
    description: '',
    missions: ''
  });

  useEffect(() => {
    fetchProjets();
  }, []);

  useEffect(() => {
    if (projets.length > 0) {
      const locations = [...new Set(projets.map(p => p.location).filter(Boolean))];
      setUniqueLocations(locations);
    }
  }, [projets]);

  // Base list of categories + dynamically created categories
  const baseCategories = [
    'Urbanisme & Paysage',
    'Foncier (Bornage, Division...)',
    'Topographie',
    'Ingénierie VRD',
    'Copropriété & 3D',
    'Ingénierie Sportive'
  ];

  const existingCategories = Array.from(new Set([
    ...baseCategories,
    ...projets.map(p => p.category).filter(Boolean)
  ]));

  const existingSubcategories = Array.from(new Set(
    projets.map(p => p.subcategory).filter(Boolean)
  ));

  useEffect(() => {
    if (editingProject) {
      const cat = editingProject.category || 'Urbanisme & Paysage';
      if (existingCategories.includes(cat)) {
        setSelectedCategory(cat);
        setCustomCategory('');
      } else {
        setSelectedCategory('__NEW__');
        setCustomCategory(cat);
      }

      const sub = editingProject.subcategory || '';
      if (!sub) {
        setSelectedSubcategory('');
        setCustomSubcategory('');
      } else if (existingSubcategories.includes(sub)) {
        setSelectedSubcategory(sub);
        setCustomSubcategory('');
      } else {
        setSelectedSubcategory('__NEW__');
        setCustomSubcategory(sub);
      }

      setFormState({
        title: editingProject.title || '',
        location: editingProject.location || '',
        description: editingProject.description || '',
        missions: Array.isArray(editingProject.missions) ? editingProject.missions.join(', ') : (editingProject.missions || '')
      });
    } else {
      setSelectedCategory('Urbanisme & Paysage');
      setCustomCategory('');
      setSelectedSubcategory('');
      setCustomSubcategory('');
      setFormState({
        title: '',
        location: '',
        description: '',
        missions: ''
      });
    }
  }, [editingProject]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (['title', 'location', 'description', 'missions'].includes(name)) {
      setFormState(prev => ({ ...prev, [name]: value }));
    }
  };

  const seoAnalysis = evaluateSeoScore(formState);

  const handleGeocode = async (e) => {
    e.preventDefault();
    const address = formState.location || document.querySelector('input[name="location"]')?.value;
    if (!address) return;

    setGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const latInput = document.querySelector('input[name="latitude"]');
        const lonInput = document.querySelector('input[name="longitude"]');
        if (latInput) latInput.value = lat;
        if (lonInput) lonInput.value = lon;
        showToast('Localisation trouvée sur la carte !', 'success');
      } else {
        showToast('Localisation introuvable. Veuillez entrer les coordonnées manuellement.', 'warning');
      }
    } catch (err) {
      showToast('Erreur lors de la géolocalisation.', 'error');
    } finally {
      setGeocoding(false);
    }
  };

  const fetchProjets = async () => {
    try {
      const res = await fetch('/api/admin/projets');
      const data = await res.json();
      setProjets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e, forcedStatus = null) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    const form = e.target.tagName === 'FORM' ? e.target : e.target.closest('form');
    const formData = new FormData(form);

    const finalCategory = selectedCategory === '__NEW__' ? customCategory.trim() : selectedCategory;
    const finalSubcategory = selectedSubcategory === '__NEW__' ? customSubcategory.trim() : selectedSubcategory;

    if (!finalCategory) {
      showToast('Veuillez spécifier une catégorie pour le projet.', 'error');
      setSubmitting(false);
      return;
    }

    if (selectedCategory === '__NEW__' && !customCategory.trim()) {
      showToast('Veuillez saisir le nom de la nouvelle catégorie.', 'error');
      setSubmitting(false);
      return;
    }

    if (selectedSubcategory === '__NEW__' && !customSubcategory.trim()) {
      showToast('Veuillez saisir le nom de la nouvelle sous-catégorie.', 'error');
      setSubmitting(false);
      return;
    }

    formData.set('category', finalCategory);
    formData.set('subcategory', finalSubcategory);
    
    // Vérification de la taille des fichiers (max 10 Mo)
    const filesToCheck = [
      formData.get('beforeImage'), 
      formData.get('afterImage'), 
      ...formData.getAll('gallery'),
      ...formData.getAll('documents')
    ];
    for (const file of filesToCheck) {
      if (file && file instanceof File && file.size > 10 * 1024 * 1024) {
        setMessage({ type: 'error', text: `Le fichier "${file.name}" est trop volumineux (max 10 Mo).` });
        showToast(`Le fichier "${file.name}" dépasse 10 Mo`, 'error');
        setSubmitting(false);
        return;
      }
    }

    const status = forcedStatus || formData.get('status') || (editingProject?.status) || 'published';
    formData.set('status', status);

    try {
      const res = await fetch('/api/admin/projets', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        const msgText = status === 'draft' ? 'Réalisation enregistrée en brouillon' : (editingProject ? 'Réalisation mise à jour !' : 'Réalisation publiée !');
        setMessage({ type: 'success', text: msgText });
        showToast(msgText, 'success');
        if (!editingProject) {
          form.reset();
          setFormState({ title: '', location: '', description: '', missions: '' });
          setSelectedCategory('Urbanisme & Paysage');
          setCustomCategory('');
          setSelectedSubcategory('');
          setCustomSubcategory('');
        }
        setEditingProject(null);
        fetchProjets();
      } else {
        setMessage({ type: 'error', text: result.message || 'Une erreur est survenue' });
        showToast(result.message || 'Une erreur est survenue', 'error');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
      showToast('Erreur de connexion au serveur', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cette réalisation ?')) return;

    try {
      const res = await fetch('/api/admin/projets', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        showToast('Réalisation supprimée', 'info');
        fetchProjets();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingProject(null);
    setMessage({ type: '', text: '' });
    setFormState({ title: '', location: '', description: '', missions: '' });
    setSelectedCategory('Urbanisme & Paysage');
    setCustomCategory('');
    setSelectedSubcategory('');
    setCustomSubcategory('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12" style={{ gap: '2rem' }}>
      {/* Form Column */}
      {canEdit && (
        <div className="lg:col-span-5">
          <GlassCard style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
              <div style={{ color: 'var(--primary-color)' }}>
                {editingProject ? <FileText size={24} /> : <Plus size={24} />}
              </div>
              <h2 style={{ fontSize: '1.2rem', color: colors.text, margin: 0 }}>
                {editingProject ? 'Modifier la Réalisation' : 'Nouvelle Réalisation'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.9rem', color: colors.textMuted, fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Titre de l'opération *</label>
                <input 
                  name="title" 
                  type="text" 
                  required 
                  value={formState.title}
                  onChange={handleInputChange}
                  placeholder="ex: Eco-quartier de la Vallée"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.15)' : '#e2e8f0'}`, backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'white', color: colors.text, fontSize: '0.9rem' }} 
                />
                {editingProject && <input type="hidden" name="id" value={editingProject.id} />}
              </div>

              {/* Catégorie & Sous-catégorie Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '1rem' }}>
                
                {/* Catégorie Principale */}
                <div className="form-group">
                  <label style={{ fontSize: '0.9rem', color: colors.textMuted, fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                    Catégorie Principale *
                  </label>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.15)' : '#e2e8f0'}`, fontSize: '0.9rem', backgroundColor: darkMode ? '#1e293b' : 'white', color: colors.text }}
                  >
                    {existingCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__NEW__">➕ Autre / Créer une catégorie...</option>
                  </select>

                  {selectedCategory === '__NEW__' && (
                    <input 
                      type="text"
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Saisissez la nouvelle catégorie..."
                      style={{ width: '100%', marginTop: '0.5rem', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--primary-color)', backgroundColor: darkMode ? 'rgba(0,0,0,0.3)' : '#f0fdf4', color: colors.text, fontSize: '0.85rem' }}
                    />
                  )}
                </div>

                {/* Sous-catégorie */}
                <div className="form-group">
                  <label style={{ fontSize: '0.9rem', color: colors.textMuted, fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                    Sous-catégorie (Optionnelle)
                  </label>
                  <select 
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.15)' : '#e2e8f0'}`, fontSize: '0.9rem', backgroundColor: darkMode ? '#1e293b' : 'white', color: colors.text }}
                  >
                    <option value="">Aucune sous-catégorie</option>
                    {existingSubcategories.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                    <option value="__NEW__">➕ Autre / Créer une sous-catégorie...</option>
                  </select>

                  {selectedSubcategory === '__NEW__' && (
                    <input 
                      type="text"
                      required
                      value={customSubcategory}
                      onChange={(e) => setCustomSubcategory(e.target.value)}
                      placeholder="Saisissez la nouvelle sous-catégorie..."
                      style={{ width: '100%', marginTop: '0.5rem', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--accent-color, #10b981)', backgroundColor: darkMode ? 'rgba(0,0,0,0.3)' : '#fefce8', color: colors.text, fontSize: '0.85rem' }}
                    />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.9rem', color: colors.textMuted, fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Localisation *</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    name="location" 
                    type="text" 
                    required
                    list="locations-list"
                    value={formState.location}
                    onChange={handleInputChange}
                    placeholder="ex: Saint-Renan (29)" 
                    style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.15)' : '#e2e8f0'}`, backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'white', color: colors.text, fontSize: '0.9rem' }} 
                  />
                  <datalist id="locations-list">
                    {uniqueLocations.map(loc => <option key={loc} value={loc} />)}
                  </datalist>
                  <button 
                    type="button"
                    onClick={handleGeocode}
                    disabled={geocoding}
                    style={{ 
                      padding: '0.8rem', 
                      borderRadius: '10px', 
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : '#f1f5f9', 
                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.15)' : '#e2e8f0'}`,
                      cursor: 'pointer',
                      color: 'var(--primary-color)'
                    }}
                    title="Vérifier sur la carte"
                  >
                    {geocoding ? '...' : <MapPin size={18} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: colors.textMuted, fontWeight: '600', marginBottom: '0.4rem', display: 'block' }}>Latitude (auto)</label>
                  <input 
                    name="latitude" 
                    type="number" 
                    step="any"
                    defaultValue={editingProject?.latitude || ''}
                    placeholder="48.44..." 
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.15)' : '#e2e8f0'}`, backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'white', color: colors.text, fontSize: '0.8rem' }} 
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: colors.textMuted, fontWeight: '600', marginBottom: '0.4rem', display: 'block' }}>Longitude (auto)</label>
                  <input 
                    name="longitude" 
                    type="number" 
                    step="any"
                    defaultValue={editingProject?.longitude || ''}
                    placeholder="-4.62..." 
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.15)' : '#e2e8f0'}`, backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'white', color: colors.text, fontSize: '0.8rem' }} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.9rem', color: colors.textMuted, fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Maître d'Ouvrage (Client)</label>
                <input 
                  name="client" 
                  type="text" 
                  defaultValue={editingProject?.client || ''}
                  placeholder="ex: Commune de Plouzané" 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.15)' : '#e2e8f0'}`, backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'white', color: colors.text, fontSize: '0.9rem' }} 
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.9rem', color: colors.textMuted, fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Missions (séparées par virgules)</label>
                <input 
                  name="missions" 
                  type="text" 
                  value={formState.missions}
                  onChange={handleInputChange}
                  placeholder="ex: Maîtrise d'œuvre, Bornage, Suivi de chantier..." 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.15)' : '#e2e8f0'}`, backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'white', color: colors.text, fontSize: '0.9rem' }} 
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.9rem', color: colors.textMuted, fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Description détaillée *</label>
                <textarea 
                  name="description" 
                  required 
                  rows="5" 
                  value={formState.description}
                  onChange={handleInputChange}
                  placeholder="Présentez le projet, ses enjeux et notre intervention..."
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.15)' : '#e2e8f0'}`, backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'white', color: colors.text, fontSize: '0.9rem', resize: 'vertical' }}
                ></textarea>
              </div>

              {/* 🎯 WIDGET JAUGE RÉFÉRENCEMENT SEO */}
              <div style={{
                backgroundColor: darkMode ? 'rgba(0,0,0,0.25)' : '#f8fafc',
                padding: '1.25rem',
                borderRadius: '14px',
                border: `1px solid ${seoAnalysis.score >= 75 ? 'rgba(16, 185, 129, 0.4)' : seoAnalysis.score >= 45 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.9rem', color: colors.text }}>
                    <Search size={18} style={{ color: 'var(--primary-color)' }} />
                    <span>Jauge Référencement SEO</span>
                  </div>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    color: 'white',
                    backgroundColor: seoAnalysis.score >= 75 ? '#10b981' : seoAnalysis.score >= 45 ? '#f59e0b' : '#ef4444',
                    transition: 'background-color 0.3s ease'
                  }}>
                    {seoAnalysis.score}% {seoAnalysis.score >= 75 ? '• Excellent' : seoAnalysis.score >= 45 ? '• Moyen' : '• À optimiser'}
                  </span>
                </div>

                {/* Barre de progression */}
                <div style={{ width: '100%', height: '8px', backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                  <div style={{
                    width: `${seoAnalysis.score}%`,
                    height: '100%',
                    backgroundColor: seoAnalysis.score >= 75 ? '#10b981' : seoAnalysis.score >= 45 ? '#f59e0b' : '#ef4444',
                    transition: 'width 0.4s ease, background-color 0.4s ease'
                  }} />
                </div>

                {/* Badges et conseils d'optimisation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {seoAnalysis.feedback.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: colors.textMuted }}>
                      {item.type === 'success' && <CheckCircle2 size={14} style={{ color: '#10b981', flexShrink: 0 }} />}
                      {item.type === 'warning' && <Sparkles size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />}
                      {item.type === 'danger' && <AlertCircle size={14} style={{ color: '#ef4444', flexShrink: 0 }} />}
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.9rem', color: colors.textMuted, fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Détails Techniques</label>
                <input 
                  name="technicalDetails" 
                  type="text" 
                  defaultValue={editingProject?.technicalDetails || ''}
                  placeholder="ex: 45 lots, 3 hectares, 2 km de réseaux..." 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.15)' : '#e2e8f0'}`, backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'white', color: colors.text, fontSize: '0.9rem' }} 
                />
              </div>

              <div style={{ backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: `1px dashed ${darkMode ? 'rgba(255,255,255,0.15)' : '#e2e8f0'}` }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📸 COMPARISON AVANT / APRÈS
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', color: colors.textMuted, fontWeight: '700', marginBottom: '0.4rem', display: 'block' }}>IMAGE AVANT</label>
                    <input name="beforeImage" type="file" accept="image/*" style={{ fontSize: '0.7rem', width: '100%', color: colors.text }} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', color: colors.textMuted, fontWeight: '700', marginBottom: '0.4rem', display: 'block' }}>IMAGE APRÈS</label>
                    <input name="afterImage" type="file" accept="image/*" style={{ fontSize: '0.7rem', width: '100%', color: colors.text }} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.9rem', color: colors.textMuted, fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Galerie Photos (Plusieurs fichiers possibles)</label>
                <input name="gallery" type="file" accept="image/*" multiple style={{ fontSize: '0.8rem', width: '100%', color: colors.text }} />
              </div>
              
              <div className="form-group">
                <label style={{ fontSize: '0.9rem', color: colors.textMuted, fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Documents PDF (Plaquettes, plans, PV...)</label>
                <input name="documents" type="file" accept=".pdf" multiple style={{ fontSize: '0.8rem', width: '100%', color: colors.text }} />
                {editingProject?.documents && editingProject.documents.length > 0 && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : '#f8fafc', padding: '0.5rem', borderRadius: '6px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}` }}>
                    <span style={{ fontWeight: '700', color: colors.text, display: 'block', marginBottom: '0.2rem' }}>Fichiers attachés :</span>
                    <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                      {editingProject.documents.map((doc, idx) => (
                        <li key={idx} style={{ color: '#0284c7' }}>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: '#0284c7' }}>
                            {doc.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {message.text && (
                <div style={{ 
                  padding: '1rem', 
                  borderRadius: '10px', 
                  backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                  color: message.type === 'success' ? '#166534' : '#991b1b',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  {message.text}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {editingProject && (
                    <button 
                      type="button" 
                      onClick={handleCancel}
                      style={{
                        flex: 1,
                        padding: '1rem',
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'white',
                        color: colors.text,
                        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.15)' : '#e2e8f0'}`,
                        borderRadius: '10px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Annuler
                    </button>
                  )}
                  
                  {/* Bouton Brouillon */}
                  {(!editingProject || editingProject.status === 'draft') && (
                    <button 
                      type="button" 
                      onClick={(e) => handleSubmit(e, 'draft')}
                      disabled={submitting}
                      style={{
                        flex: 1,
                        padding: '1rem',
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                        color: colors.textMuted,
                        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.15)' : '#e2e8f0'}`,
                        borderRadius: '10px',
                        fontWeight: '700',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {submitting ? '...' : 'Enregistrer brouillon'}
                    </button>
                  )}
                </div>

                <button 
                  type="button" 
                  onClick={(e) => handleSubmit(e, 'published')}
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '700',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.2s',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? 'Publication...' : editingProject ? (editingProject.status === 'draft' ? 'Publier maintenant' : 'Mettre à jour') : 'Publier la réalisation'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* List Column */}
      <div className={canEdit ? "lg:col-span-7" : "lg:col-span-12"}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: colors.text, display: 'flex', alignItems: 'center', gap: '0.8rem', margin: 0 }}>
            <LayoutGrid size={20} /> Réalisations ({projets.length})
          </h2>
          <button 
            onClick={fetchProjets}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.15)' : '#e2e8f0'}`, background: darkMode ? 'rgba(255,255,255,0.05)' : 'white', color: colors.text, fontSize: '0.8rem', cursor: 'pointer' }}
          >
            Actualiser
          </button>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: colors.textMuted }}>Chargement des projets...</div>
        ) : projets.length === 0 ? (
          <GlassCard style={{ padding: '4rem', textAlign: 'center', color: colors.textMuted }}>
            Aucune réalisation pour le moment. Utilisez le formulaire pour en ajouter une.
          </GlassCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {projets.map((p) => (
              <GlassCard key={p.id} style={{ padding: '1.2rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f1f5f9' }}>
                  <img 
                    src={p.image_after || p.images_gallery?.[0] || '/og-image.png'} 
                    alt={p.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <h3 style={{ fontSize: '1rem', color: colors.text, margin: 0 }}>{p.title}</h3>
                    {p.status === 'draft' && (
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '4px', fontWeight: '700' }}>
                        Brouillon
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <span style={{ backgroundColor: 'rgba(121, 160, 129, 0.15)', color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      {p.category || 'Non classé'}
                    </span>
                    {p.subcategory && (
                      <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#2563eb', fontSize: '0.75rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        {p.subcategory}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.8rem', color: colors.textMuted, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={14} /> {p.location}
                  </p>
                </div>
                {canEdit && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleEdit(p)}
                      style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: 'var(--primary-color)' }}
                      title="Modifier"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id)}
                      style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fef2f2', cursor: 'pointer', color: '#ef4444' }}
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
