'use client';

import { useState, useEffect } from 'react';
import GlassCard from '../../../components/GlassCard';
import { 
  Save, Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, 
  HelpCircle, Globe, List, CheckCircle, ArrowRight, Settings, Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fr } from '../../../i18n/fr';
import { en } from '../../../i18n/en';
import { br } from '../../../i18n/br';

const translations = { fr, en, br };

// Helper to safely get nested default translations
function getDefaultText(lang, keypath) {
  const keys = keypath.split('.');
  let value = translations[lang];
  for (const key of keys) {
    if (value && value[key] !== undefined) {
      value = value[key];
    } else {
      return '';
    }
  }
  return value;
}

const CATEGORIES = [
  {
    id: 'home',
    name: 'Page d\'Accueil',
    description: 'En-tête, Hero, Statistiques, et Domaines d\'Expertise.',
    fields: [
      { key: 'hero.title_part1', label: 'Titre Hero (Partie 1)', type: 'text' },
      { key: 'hero.title_part2', label: 'Titre Hero (Partie 2)', type: 'text' },
      { key: 'hero.description', label: 'Description Hero', type: 'textarea' },
      { key: 'hero.cta_contact', label: 'Bouton Contact', type: 'text' },
      { key: 'hero.cta_more', label: 'Bouton En savoir plus', type: 'text' },
      
      // Stats numbers
      { key: 'stats.creation.number', label: 'Stat 1 : Valeur (ex: 2007)', type: 'text', isStatVal: true },
      { key: 'stats.creation.label', label: 'Stat 1 : Libellé', type: 'text' },
      { key: 'stats.creation.desc', label: 'Stat 1 : Description', type: 'textarea' },
      
      { key: 'stats.collaborators.number', label: 'Stat 2 : Valeur (ex: 19)', type: 'text', isStatVal: true },
      { key: 'stats.collaborators.label', label: 'Stat 2 : Libellé', type: 'text' },
      { key: 'stats.collaborators.desc', label: 'Stat 2 : Description', type: 'textarea' },
      
      { key: 'stats.projects.number', label: 'Stat 3 : Valeur (ex: 500)', type: 'text', isStatVal: true },
      { key: 'stats.projects.suffix', label: 'Stat 3 : Suffixe (ex: +)', type: 'text', isStatVal: true },
      { key: 'stats.projects.label', label: 'Stat 3 : Libellé', type: 'text' },
      { key: 'stats.projects.desc', label: 'Stat 3 : Description', type: 'textarea' },
      
      // Domaines intro
      { key: 'expertise.title', label: 'Titre de la section "Nos Domaines d\'Expertise"', type: 'text' },
      { key: 'expertise.subtitle', label: 'Sous-titre de la section "Nos Domaines d\'Expertise"', type: 'textarea' },
      
      // Items expertises
      { key: 'expertise.items.urbanisme.title', label: 'Urbanisme & Paysage : Titre', type: 'text' },
      { key: 'expertise.items.urbanisme.desc', label: 'Urbanisme & Paysage : Courte description', type: 'textarea' },
      { key: 'expertise.items.urbanisme.longDesc', label: 'Urbanisme & Paysage : Longue description', type: 'textarea' },
      
      { key: 'expertise.items.geometre.title', label: 'Géomètre-Expert Foncier : Titre', type: 'text' },
      { key: 'expertise.items.geometre.desc', label: 'Géomètre-Expert Foncier : Courte description', type: 'textarea' },
      { key: 'expertise.items.geometre.longDesc', label: 'Géomètre-Expert Foncier : Longue description', type: 'textarea' },
      
      { key: 'expertise.items.vrd.title', label: 'Ingénierie VRD : Titre', type: 'text' },
      { key: 'expertise.items.vrd.desc', label: 'Ingénierie VRD : Courte description', type: 'textarea' },
      { key: 'expertise.items.vrd.longDesc', label: 'Ingénierie VRD : Longue description', type: 'textarea' },
      
      { key: 'expertise.items.sport.title', label: 'Ingénierie Sportive : Titre', type: 'text' },
      { key: 'expertise.items.sport.desc', label: 'Ingénierie Sportive : Courte description', type: 'textarea' },
      { key: 'expertise.items.sport.longDesc', label: 'Ingénierie Sportive : Longue description', type: 'textarea' },
      
      { key: 'expertise.items.topographie.title', label: 'Topographie : Titre', type: 'text' },
      { key: 'expertise.items.topographie.desc', label: 'Topographie : Courte description', type: 'textarea' },
      { key: 'expertise.items.topographie.longDesc', label: 'Topographie : Longue description', type: 'textarea' },
      
      { key: 'expertise.items.copropriete.title', label: 'Pôle Copropriété & 3D : Titre', type: 'text' },
      { key: 'expertise.items.copropriete.desc', label: 'Pôle Copropriété & 3D : Courte description', type: 'textarea' },
      { key: 'expertise.items.copropriete.longDesc', label: 'Pôle Copropriété & 3D : Longue description', type: 'textarea' },
      
      // CTA
      { key: 'expertise.cta_desc', label: 'Bannière d\'accroche : "Découvrez comment notre équipe peut vous aider."', type: 'text' },
      
      // Clients
      { key: 'references.title', label: 'Titre section Clients', type: 'text' },
      { key: 'references.subtitle', label: 'Sous-titre section Clients', type: 'textarea' },
      { key: 'references.list_title', label: 'Titre liste missions marquantes', type: 'text' },

      // Avis Google / Témoignages
      { key: 'testimonials.title', label: 'Témoignages : Titre de la section', type: 'text' },
      { key: 'testimonials.subtitle', label: 'Témoignages : Sous-titre (ex: Note Globale : 5/5)', type: 'text' },
      { key: 'testimonials.cta', label: 'Témoignages : Bouton "Explorer les avis"', type: 'text' }
    ]
  },

  {
    id: 'about',
    name: 'Page L\'Agence',
    description: 'Le cabinet, Démarche Qualité, Démarche RSE, et Vidéo.',
    fields: [
      { key: 'about.header.title', label: 'Titre d\'en-tête L\'Agence', type: 'text' },
      { key: 'about.header.subtitle', label: 'Sous-titre d\'en-tête L\'Agence', type: 'textarea' },
      
      // Le cabinet
      { key: 'about.society.title', label: 'Titre "Le cabinet"', type: 'text' },
      { key: 'about.society.p1', label: 'Paragraphe 1', type: 'textarea' },
      { key: 'about.society.p2', label: 'Paragraphe 2', type: 'textarea' },
      { key: 'about.society.p3', label: 'Paragraphe 3', type: 'textarea' },
      { key: 'about.society.media_placeholder', label: 'Libellé de remplacement pour photo d\'équipe', type: 'text' },
      
      // Démarche Qualité
      { key: 'about.quality.title', label: 'Titre section "Qualité"', type: 'text' },
      { key: 'about.quality.subtitle', label: 'Sous-titre section "Qualité"', type: 'textarea' },
      
      { key: 'about.quality.engagement.title', label: 'Titre "Engagement Qualité"', type: 'text' },
      { key: 'about.quality.engagement.p1', label: 'Paragraphe principal "Engagement Qualité"', type: 'textarea' },
      
      { key: 'about.quality.assurance.title', label: 'Titre "Assurance Qualité"', type: 'text' },
      { key: 'about.quality.assurance.p1', label: 'Paragraphe principal "Assurance Qualité"', type: 'textarea' },
      
      { key: 'about.quality.control.title', label: 'Titre "Contrôle Qualité"', type: 'text' },
      { key: 'about.quality.control.p1', label: 'Paragraphe 1 "Contrôle Qualité"', type: 'textarea' },
      { key: 'about.quality.control.p2', label: 'Paragraphe 2 "Contrôle Qualité"', type: 'textarea' },
      
      { key: 'about.quality.communication.title', label: 'Titre "Communication"', type: 'text' },
      { key: 'about.quality.communication.p1', label: 'Paragraphe "Communication"', type: 'textarea' },
      
      // Démarche RSE
      { key: 'about.rse.title', label: 'Titre section "RSE"', type: 'text' },
      { key: 'about.rse.subtitle', label: 'Sous-titre section "RSE"', type: 'textarea' },
      { key: 'about.rse.environmental.title', label: 'Pilier Environnemental : Titre', type: 'text' },
      { key: 'about.rse.environmental.desc', label: 'Pilier Environnemental : Description', type: 'textarea' },
      
      { key: 'about.rse.social.title', label: 'Pilier Social : Titre', type: 'text' },
      { key: 'about.rse.social.desc', label: 'Pilier Social : Description', type: 'textarea' },
      
      { key: 'about.rse.territorial.title', label: 'Pilier Territorial : Titre', type: 'text' },
      { key: 'about.rse.territorial.desc', label: 'Pilier Territorial : Description', type: 'textarea' },
      
      // Vidéo
      { key: 'about.video.title', label: 'Titre section Vidéo', type: 'text' },
      { key: 'about.video.subtitle', label: 'Sous-titre section Vidéo', type: 'textarea' },
      { key: 'about.video.fallback', label: 'Erreur lecture vidéo', type: 'text' }
    ]
  },
  {
    id: 'expertises',
    name: 'Pages Expertises',
    description: 'Sous-titres et introductions des pages de réalisation, clients, et partenaires.',
    fields: [
      { key: 'projects.subtitle', label: 'Intro Nos Réalisations ("De la topographie...")', type: 'textarea' },
      { key: 'clients.subtitle', label: 'Intro Confiance Clients ("Ils nous font confiance...")', type: 'text' },
      { key: 'partners.subtitle', label: 'Intro Partenaires ("Parce que chaque projet...")', type: 'textarea' }
    ]
  },
  {
    id: 'resources',
    name: 'Pages Ressources',
    description: 'Textes pour la page RSE détaillée.',
    fields: [
      { key: 'rse_page.title', label: 'Page RSE : Titre principal', type: 'text' },
      { key: 'rse_page.subtitle', label: 'Page RSE : Sous-titre principal', type: 'textarea' },
      
      { key: 'rse_page.pillars.environmental.title', label: 'RSE Page : Titre pilier Environnement', type: 'text' },
      { key: 'rse_page.pillars.environmental.desc', label: 'RSE Page : Description pilier Environnement', type: 'textarea' },
      
      { key: 'rse_page.pillars.social.title', label: 'RSE Page : Titre pilier Social', type: 'text' },
      { key: 'rse_page.pillars.social.desc', label: 'RSE Page : Description pilier Social', type: 'textarea' },
      
      { key: 'rse_page.pillars.territorial.title', label: 'RSE Page : Titre pilier Territorial', type: 'text' },
      { key: 'rse_page.pillars.territorial.desc', label: 'RSE Page : Description pilier Territorial', type: 'textarea' },
      
      { key: 'rse_page.cta_title', label: 'RSE Page : Titre CTA bas de page', type: 'text' },
      { key: 'rse_page.cta_desc', label: 'RSE Page : Description CTA bas de page', type: 'textarea' },
      { key: 'rse_page.cta_btn', label: 'RSE Page : Texte bouton CTA', type: 'text' }
    ]
  },
  {
    id: 'contact',
    name: 'Contactez-nous',
    description: 'Adresses des agences, téléphone, e-mail et horaires d\'ouverture.',
    fields: [
      { key: 'contact.header.title', label: 'Titre principal de la page', type: 'text' },
      { key: 'contact.header.subtitle', label: 'Sous-titre de la page', type: 'textarea' },
      { key: 'contact.info.title', label: 'Titre "Nos Coordonnées"', type: 'text' },
      { key: 'contact.info.renan', label: 'Titre "Agence de Saint-Renan"', type: 'text' },
      { key: 'contact.info.douarnenez', label: 'Titre "Agence de Douarnenez"', type: 'text' },
      { key: 'contact.info.email_label', label: 'Libellé "Adresse Électronique"', type: 'text' },
      { key: 'contact.info.hours_label', label: 'Libellé "Horaires d\'ouverture"', type: 'text' },
      
      // Horaires
      { key: 'contact.info.hours.mon', label: 'Horaires Lundi', type: 'text' },
      { key: 'contact.info.hours.tue', label: 'Horaires Mardi', type: 'text' },
      { key: 'contact.info.hours.wed', label: 'Horaires Mercredi', type: 'text' },
      { key: 'contact.info.hours.thu', label: 'Horaires Jeudi', type: 'text' },
      { key: 'contact.info.hours.fri', label: 'Horaires Vendredi', type: 'text' },
      { key: 'contact.info.hours.sat_sun', label: 'Horaires Samedi - Dimanche', type: 'text' },
      { key: 'contact.info.hours.closed', label: 'Libellé "Fermé"', type: 'text' }
    ]
  },
  {
    id: 'lists',
    name: 'Listes de Textes',
    description: 'Missions marquantes, points d\'engagements Qualité & RSE.',
    fields: [
      { key: 'references.items', label: 'Missions de maîtrise d\'œuvre marquantes (Accueil)', type: 'list' },
      { key: 'about.quality.engagement.list', label: 'Démarche Qualité : Engagements (Agence)', type: 'list' },
      { key: 'about.quality.assurance.list', label: 'Démarche Qualité : Assurance (Agence)', type: 'list' },
      { key: 'about.quality.communication.list', label: 'Démarche Qualité : Communication (Agence)', type: 'list' },
      { key: 'about.rse.environmental.items', label: 'Agence RSE : Items Environnement', type: 'list' },
      { key: 'about.rse.social.items', label: 'Agence RSE : Items Social', type: 'list' },
      { key: 'about.rse.territorial.items', label: 'Agence RSE : Items Territorial', type: 'list' },
      { key: 'rse_page.pillars.environmental.items', label: 'RSE Page : Items Environnement', type: 'list' },
      { key: 'rse_page.pillars.social.items', label: 'RSE Page : Items Social', type: 'list' },
      { key: 'rse_page.pillars.territorial.items', label: 'RSE Page : Items Territorial', type: 'list' }
    ]
  }
];

export default function TextsManager() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeLang, setActiveLang] = useState('fr');
  const [dbTexts, setDbTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [savingAll, setSavingAll] = useState(false);

  // Form State dictionary: { [key]: { fr: '...', en: '...', br: '...' } }
  const [formState, setFormState] = useState({});

  // Moyens Techniques list state
  const [moyensSections, setMoyensSections] = useState([]);

  useEffect(() => {
    fetchTexts();
  }, []);

  const fetchTexts = async () => {
    try {
      const res = await fetch('/api/admin/texts');
      if (res.ok) {
        const data = await res.json();
        setDbTexts(data);
        
        // Build forms dictionary
        const state = {};
        
        // Initialize with default values from local files
        CATEGORIES.forEach(cat => {
          cat.fields.forEach(field => {
            state[field.key] = {
              fr: getDefaultText('fr', field.key),
              en: getDefaultText('en', field.key),
              br: getDefaultText('br', field.key)
            };
          });
        });

        // Merge DB overrides
        data.forEach(item => {
          if (state[item.key]) {
            state[item.key] = {
              fr: item.fr || '',
              en: item.en || '',
              br: item.br || ''
            };
          } else {
            // Unregistered keys (like feature flags or lists)
            state[item.key] = {
              fr: item.fr || '',
              en: item.en || '',
              br: item.br || ''
            };
          }
        });

        setFormState(state);

        // Load Means (Moyens Techniques)
        const dbMoyens = data.find(item => item.key === 'technical.sections');
        if (dbMoyens) {
          try {
            setMoyensSections(JSON.parse(dbMoyens.fr || '[]'));
          } catch (e) {
            setMoyensSections(getDefaultMoyens());
          }
        } else {
          setMoyensSections(getDefaultMoyens());
        }

      }
    } catch (err) {
      console.error('Erreur chargement des textes :', err);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultMoyens = () => {
    return [
      { id: "infra", title: getDefaultText('fr', 'technical.infrastructure.title') || "Bureaux & Infrastructures", icon: "building", list: getDefaultText('fr', 'technical.infrastructure.list') || [] },
      { id: "field", title: getDefaultText('fr', 'technical.field.title') || "Équipements Terrain", icon: "map-pin", list: getDefaultText('fr', 'technical.field.list') || [], showFieldImages: true },
      { id: "computing", title: getDefaultText('fr', 'technical.computing.title') || "Pôle DAO & Bureautique", icon: "monitor", list: getDefaultText('fr', 'technical.computing.list') || [] },
      { id: "software", title: getDefaultText('fr', 'technical.software.title') || "Environnement Logiciel", icon: "software", desc: getDefaultText('fr', 'technical.software.desc') || "", showSoftwareImages: true },
      { id: "reprography", title: getDefaultText('fr', 'technical.reprography.title') || "Reprographie & Impression Grand Format", icon: "printer", list: getDefaultText('fr', 'technical.reprography.list') || [], fullWidth: true }
    ];
  };

  const updateField = (key, lang, value) => {
    setFormState(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [lang]: value
      }
    }));
  };

  const updateListField = (key, lang, index, value) => {
    const currentListVal = formState[key]?.[lang] || '[]';
    let listArr = [];
    try {
      listArr = JSON.parse(currentListVal);
      if (!Array.isArray(listArr)) listArr = [];
    } catch (e) {
      // Try to read from static default if parsing failed
      const def = getDefaultText(lang, key);
      listArr = Array.isArray(def) ? def : [];
    }

    const newList = [...listArr];
    newList[index] = value;

    setFormState(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [lang]: JSON.stringify(newList)
      }
    }));
  };

  const addListItem = (key, lang) => {
    const currentListVal = formState[key]?.[lang] || '[]';
    let listArr = [];
    try {
      listArr = JSON.parse(currentListVal);
      if (!Array.isArray(listArr)) listArr = [];
    } catch (e) {
      const def = getDefaultText(lang, key);
      listArr = Array.isArray(def) ? [...def] : [];
    }

    listArr.push('');
    setFormState(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [lang]: JSON.stringify(listArr)
      }
    }));
  };

  const deleteListItem = (key, lang, index) => {
    const currentListVal = formState[key]?.[lang] || '[]';
    let listArr = [];
    try {
      listArr = JSON.parse(currentListVal);
      if (!Array.isArray(listArr)) listArr = [];
    } catch (e) {
      const def = getDefaultText(lang, key);
      listArr = Array.isArray(def) ? [...def] : [];
    }

    listArr.splice(index, 1);
    setFormState(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [lang]: JSON.stringify(listArr)
      }
    }));
  };

  const saveKey = async (key) => {
    setSavingKey(key);
    try {
      const value = formState[key];
      const res = await fetch('/api/admin/texts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          fr: value.fr,
          en: value.en || null,
          br: value.br || null
        })
      });
      if (res.ok) {
        alert('Texte enregistré avec succès !');
      } else {
        alert('Erreur lors de l\'enregistrement.');
      }
    } catch (e) {
      console.error(e);
      alert('Erreur de connexion.');
    } finally {
      setSavingKey(null);
    }
  };

  const saveCategory = async (catId) => {
    setSavingAll(true);
    try {
      const category = CATEGORIES.find(c => c.id === catId);
      if (!category) return;

      const promises = category.fields.map(async (field) => {
        const value = formState[field.key];
        return fetch('/api/admin/texts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: field.key,
            fr: value.fr,
            en: value.en || null,
            br: value.br || null
          })
        });
      });

      await Promise.all(promises);
      alert('Toute la catégorie a été mise à jour !');
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la sauvegarde groupée.');
    } finally {
      setSavingAll(false);
    }
  };

  // Means (Moyens Techniques) functions
  const handleMoyensUpdate = (index, field, value) => {
    const updated = [...moyensSections];
    updated[index] = { ...updated[index], [field]: value };
    setMoyensSections(updated);
  };

  const handleMoyensListUpdate = (sectionIndex, bulletIndex, value) => {
    const updated = [...moyensSections];
    const sectionList = [...(updated[sectionIndex].list || [])];
    sectionList[bulletIndex] = value;
    updated[sectionIndex] = { ...updated[sectionIndex], list: sectionList };
    setMoyensSections(updated);
  };

  const addMoyensBullet = (sectionIndex) => {
    const updated = [...moyensSections];
    const sectionList = [...(updated[sectionIndex].list || [])];
    sectionList.push('');
    updated[sectionIndex] = { ...updated[sectionIndex], list: sectionList };
    setMoyensSections(updated);
  };

  const removeMoyensBullet = (sectionIndex, bulletIndex) => {
    const updated = [...moyensSections];
    const sectionList = [...(updated[sectionIndex].list || [])];
    sectionList.splice(bulletIndex, 1);
    updated[sectionIndex] = { ...updated[sectionIndex], list: sectionList };
    setMoyensSections(updated);
  };

  const moveMoyens = (index, direction) => {
    const updated = [...moyensSections];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= moyensSections.length) return;
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    setMoyensSections(updated);
  };

  const removeMoyensSection = (index) => {
    if (confirm('Supprimer cette case de vos moyens techniques ?')) {
      const updated = moyensSections.filter((_, i) => i !== index);
      setMoyensSections(updated);
    }
  };

  const addMoyensSection = () => {
    const newSection = {
      id: `moyen-${Date.now()}`,
      title: 'Nouveau Moyen Technique',
      icon: 'building',
      list: ['Nouveau point d\'équipement']
    };
    setMoyensSections([...moyensSections, newSection]);
  };

  const saveMoyens = async () => {
    setSavingKey('technical.sections');
    try {
      // French is mandatory and default
      const res = await fetch('/api/admin/texts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'technical.sections',
          fr: JSON.stringify(moyensSections),
          en: null, // Keep the same array for all since items have simple structure or let them fallback
          br: null
        })
      });
      if (res.ok) {
        alert('Moyens techniques sauvegardés avec succès !');
      } else {
        alert('Erreur lors de la sauvegarde.');
      }
    } catch (e) {
      console.error(e);
      alert('Erreur réseau.');
    } finally {
      setSavingKey(null);
    }
  };

  // Tools visibility management
  const getToolVisible = (toolKey) => {
    return formState[`tools.${toolKey}.visible`]?.fr !== 'false';
  };

  const toggleToolVisible = async (toolKey) => {
    const currentVal = getToolVisible(toolKey);
    const newVal = !currentVal ? 'true' : 'false';
    
    // Update local state first
    setFormState(prev => ({
      ...prev,
      [`tools.${toolKey}.visible`]: { fr: newVal, en: newVal, br: newVal }
    }));

    try {
      const res = await fetch('/api/admin/texts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: `tools.${toolKey}.visible`,
          fr: newVal,
          en: newVal,
          br: newVal
        })
      });
      if (!res.ok) {
        alert('Impossible de sauvegarder la visibilité de l\'outil.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <p>Chargement du gestionnaire des textes...</p>;

  const currentCategory = CATEGORIES.find(c => c.id === activeTab);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Textes & Traductions du Site</h2>
          <p style={{ color: '#64748b' }}>Personnalisez et traduisez tous les textes de vos pages en direct.</p>
        </div>
      </div>

      {/* Barre supérieure : sélecteur de langue + boutons globaux */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        {/* Sélecteur de langue */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          backgroundColor: '#f1f5f9',
          padding: '0.4rem',
          borderRadius: '12px',
          width: 'fit-content',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
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
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: activeLang === lang ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Globe size={16} />
              {lang.toUpperCase()} {lang === 'fr' && <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 'bold' }}>(Mandatory)</span>}
            </button>
          ))}
        </div>

        {/* Bouton de sauvegarde de la catégorie en cours */}
        {currentCategory && (
          <button 
            onClick={() => saveCategory(currentCategory.id)}
            disabled={savingAll}
            className="btn btn-primary"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Save size={18} /> {savingAll ? 'Sauvegarde groupée...' : 'Sauvegarder cette page'}
          </button>
        )}
      </div>

      {/* Grille Principale */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Menu Gauche des Pages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', paddingLeft: '0.5rem' }}>Pages</p>
          
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              style={{
                padding: '0.8rem 1rem',
                borderRadius: '10px',
                border: 'none',
                textAlign: 'left',
                backgroundColor: activeTab === cat.id ? 'var(--primary-color)' : 'transparent',
                color: activeTab === cat.id ? '#white' : '#475569',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem'
              }}
            >
              <span style={{ color: activeTab === cat.id ? 'white' : 'inherit', fontSize: '0.95rem' }}>{cat.name}</span>
              <span style={{ color: activeTab === cat.id ? 'rgba(255,255,255,0.7)' : '#94a3b8', fontSize: '0.7rem', fontWeight: 'normal' }}>{cat.description.substring(0, 45)}...</span>
            </button>
          ))}

          <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '0.5rem 0' }}></div>
          <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', paddingLeft: '0.5rem' }}>Sections Spéciales</p>

          <button
            onClick={() => setActiveTab('moyens')}
            style={{
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              border: 'none',
              textAlign: 'left',
              backgroundColor: activeTab === 'moyens' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'moyens' ? 'white' : '#475569',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Nos Moyens Techniques
          </button>

          <button
            onClick={() => setActiveTab('outils')}
            style={{
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              border: 'none',
              textAlign: 'left',
              backgroundColor: activeTab === 'outils' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'outils' ? 'white' : '#475569',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Visibilité des Outils
          </button>
        </div>

        {/* Zone des Formulaires (Droite) */}
        <div style={{ minWidth: 0 }}>
          
          {/* 1. Pages Classiques */}
          {currentCategory && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1.4rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {currentCategory.name}
              </h3>

              {currentCategory.fields.map(field => {
                const valueDict = formState[field.key] || { fr: '', en: '', br: '' };
                const currentVal = valueDict[activeLang] || '';
                const fallbackVal = activeLang !== 'fr' ? (valueDict.fr || getDefaultText('fr', field.key)) : getDefaultText('fr', field.key);

                if (field.type === 'list') {
                  // Lists of bullet points
                  let listItems = [];
                  try {
                    listItems = JSON.parse(currentVal);
                    if (!Array.isArray(listItems)) listItems = [];
                  } catch (e) {
                    const def = getDefaultText(activeLang, field.key);
                    listItems = Array.isArray(def) ? def : [];
                  }

                  return (
                    <GlassCard key={field.key} style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <label style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--secondary-color)' }}>
                          {field.label} ({activeLang.toUpperCase()})
                        </label>
                        <button 
                          onClick={() => saveKey(field.key)}
                          disabled={savingKey === field.key}
                          style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#e0f2fe',
                            color: '#0369a1',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <Save size={14} /> {savingKey === field.key ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {listItems.map((itemVal, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: '#94a3b8', width: '20px' }}>{idx + 1}.</span>
                            <input 
                              type="text"
                              value={itemVal}
                              onChange={(e) => updateListField(field.key, activeLang, idx, e.target.value)}
                              style={{
                                flex: 1,
                                padding: '0.6rem',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.9rem'
                              }}
                              placeholder="Élément de la liste..."
                            />
                            <button 
                              onClick={() => deleteListItem(field.key, activeLang, idx)}
                              style={{
                                backgroundColor: '#fee2e2',
                                color: '#ef4444',
                                border: 'none',
                                padding: '0.5rem',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}

                        <button
                          onClick={() => addListItem(field.key, activeLang)}
                          style={{
                            marginTop: '0.5rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            border: '1px dashed #cbd5e1',
                            backgroundColor: 'transparent',
                            color: '#475569',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            alignSelf: 'flex-start',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <Plus size={14} /> Ajouter un point
                        </button>
                      </div>
                    </GlassCard>
                  );
                }

                // Normal texts
                return (
                  <GlassCard key={field.key} style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.8rem', gap: '1rem' }}>
                      <div>
                        <label style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--secondary-color)', display: 'block' }}>
                          {field.label}
                        </label>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Clé : {field.key}</span>
                      </div>
                      <button 
                        onClick={() => saveKey(field.key)}
                        disabled={savingKey === field.key}
                        style={{
                          padding: '0.4rem 0.8rem',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: '#e0f2fe',
                          color: '#0369a1',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <Save size={14} /> {savingKey === field.key ? 'Sauvegarde...' : 'Enregistrer'}
                      </button>
                    </div>

                    {field.type === 'textarea' ? (
                      <textarea
                        value={currentVal}
                        onChange={(e) => updateField(field.key, activeLang, e.target.value)}
                        placeholder={`Texte en ${activeLang.toUpperCase()}...`}
                        style={{
                          width: '100%',
                          minHeight: field.isStatVal ? '60px' : '100px',
                          padding: '0.8rem',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          fontSize: '0.95rem',
                          fontFamily: 'inherit',
                          lineHeight: '1.5'
                        }}
                      />
                    ) : (
                      <input
                        type="text"
                        value={currentVal}
                        onChange={(e) => updateField(field.key, activeLang, e.target.value)}
                        placeholder={`Texte en ${activeLang.toUpperCase()}...`}
                        style={{
                          width: '100%',
                          padding: '0.8rem',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          fontSize: '0.95rem'
                        }}
                      />
                    )}

                    {activeLang !== 'fr' && !currentVal && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b', backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '6px' }}>
                        <strong>Fallback (FR) :</strong> {fallbackVal || '(Vide)'}
                      </div>
                    )}
                  </GlassCard>
                );
              })}
            </div>
          )}

          {/* 2. Moyens Techniques (Dynamic list) */}
          {activeTab === 'moyens' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.8rem' }}>
                <h3 style={{ fontSize: '1.4rem', margin: 0 }}>Gestion des Moyens Techniques</h3>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <button 
                    onClick={addMoyensSection}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#f1f5f9',
                      color: '#0f172a',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Plus size={16} /> Ajouter une case
                  </button>
                  <button 
                    onClick={saveMoyens}
                    disabled={savingKey === 'technical.sections'}
                    className="btn btn-primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Save size={16} /> {savingKey === 'technical.sections' ? 'Enregistrement...' : 'Enregistrer tout'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {moyensSections.map((sec, idx) => (
                  <GlassCard key={sec.id} style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'start' }}>
                      
                      {/* Contrôles de position */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRight: '1px solid #e2e8f0', paddingRight: '1rem' }}>
                        <button 
                          onClick={() => moveMoyens(idx, -1)}
                          disabled={idx === 0}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: idx === 0 ? '#cbd5e1' : '#64748b' }}
                        >
                          <ChevronUp size={20} />
                        </button>
                        <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#94a3b8' }}>{idx + 1}</div>
                        <button 
                          onClick={() => moveMoyens(idx, 1)}
                          disabled={idx === moyensSections.length - 1}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: idx === moyensSections.length - 1 ? '#cbd5e1' : '#64748b' }}
                        >
                          <ChevronDown size={20} />
                        </button>
                      </div>

                      {/* Édition */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: '1rem', marginBottom: '1rem' }}>
                          <div>
                            <label style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Titre de la case</label>
                            <input 
                              type="text"
                              value={sec.title}
                              onChange={(e) => handleMoyensUpdate(idx, 'title', e.target.value)}
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.95rem', fontWeight: 'bold' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Icône</label>
                            <select
                              value={sec.icon}
                              onChange={(e) => handleMoyensUpdate(idx, 'icon', e.target.value)}
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
                            >
                              <option value="building">Bureaux (Bâtiment)</option>
                              <option value="map-pin">Terrain (Localisation)</option>
                              <option value="monitor">DAO (Écran)</option>
                              <option value="software">Logiciels (CPU)</option>
                              <option value="printer">Reprographie (Imprimante)</option>
                            </select>
                          </div>
                        </div>

                        {/* Visibilité des images par défaut */}
                        {(sec.id === 'field' || sec.id === 'software' || sec.showFieldImages || sec.showSoftwareImages) && (
                          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.85rem', color: '#1e40af', fontWeight: '500' }}>
                              {sec.id === 'field' || sec.showFieldImages ? 'Afficher les images du Scanner/GPS/Station Trimble' : 'Afficher les logos AutoCAD/Covadis/...'}
                            </span>
                            <button
                              onClick={() => {
                                if (sec.id === 'field' || sec.showFieldImages) {
                                  handleMoyensUpdate(idx, 'showFieldImages', !sec.showFieldImages);
                                } else {
                                  handleMoyensUpdate(idx, 'showSoftwareImages', !sec.showSoftwareImages);
                                }
                              }}
                              style={{
                                padding: '0.3rem 0.6rem',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                backgroundColor: (sec.showFieldImages || sec.showSoftwareImages) ? '#10b981' : '#64748b',
                                color: 'white'
                              }}
                            >
                              {(sec.showFieldImages || sec.showSoftwareImages) ? 'Activé' : 'Désactivé'}
                            </button>
                          </div>
                        )}

                        {/* Full Width Toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                          <input 
                            type="checkbox"
                            id={`fullwidth-${sec.id}`}
                            checked={sec.fullWidth || false}
                            onChange={(e) => handleMoyensUpdate(idx, 'fullWidth', e.target.checked)}
                          />
                          <label htmlFor={`fullwidth-${sec.id}`} style={{ fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                            Prend toute la largeur de la page (pleine largeur)
                          </label>
                        </div>

                        {/* Description unique si software */}
                        {sec.id === 'software' && (
                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Description d'introduction</label>
                            <textarea 
                              value={sec.desc || ''}
                              onChange={(e) => handleMoyensUpdate(idx, 'desc', e.target.value)}
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', minHeight: '60px', fontFamily: 'inherit', fontSize: '0.9rem' }}
                            />
                          </div>
                        )}

                        {/* Liste de puces */}
                        {sec.id !== 'software' && (
                          <div>
                            <label style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#475569', display: 'block', marginBottom: '0.5rem' }}>Points d'équipement (Puces)</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              {(sec.list || []).map((bullet, bIdx) => (
                                <div key={bIdx} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                  <input 
                                    type="text"
                                    value={bullet}
                                    onChange={(e) => handleMoyensListUpdate(idx, bIdx, e.target.value)}
                                    style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                                  />
                                  <button 
                                    onClick={() => removeMoyensBullet(idx, bIdx)}
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => addMoyensBullet(idx)}
                                style={{
                                  padding: '0.3rem 0.8rem',
                                  borderRadius: '4px',
                                  border: '1px dashed #cbd5e1',
                                  backgroundColor: 'transparent',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer',
                                  alignSelf: 'flex-start',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                  marginTop: '0.3rem'
                                }}
                              >
                                <Plus size={12} /> Ajouter une puce
                              </button>
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Suppression du Moyen */}
                      <button
                        onClick={() => removeMoyensSection(idx)}
                        style={{
                          backgroundColor: '#fee2e2',
                          color: '#ef4444',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* 3. Visibilité des Outils */}
          {activeTab === 'outils' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.8rem' }}>
                <h3 style={{ fontSize: '1.4rem', margin: 0 }}>Masquer ou Afficher les Outils</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>Cochez pour afficher l'outil dans le menu Ressources ou décochez pour le désactiver du site.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                
                {[
                  { key: 'division_simulator', name: 'Simulateur de Division', desc: 'Permet aux prospects d\'estimer la division de leur terrain.' },
                  { key: 'sun_simulator', name: 'Simulateur d\'Ensoleillement', desc: 'Outil 3D d\'étude d\'ombre portée.' },
                  { key: 'eco_diagnostic', name: 'Éco-Diagnostic', desc: 'Évaluation environnementale de parcelle.' },
                  { key: 'cadastre_map', name: 'Bornage & Cadastre', desc: 'Visualisation cartographique des parcelles.' },
                  { key: 'profil_long', name: 'Profil en Long', desc: 'Calcul de coupe altimétrique.' },
                  { key: 'my_project', name: 'Mon Projet', desc: 'Suivi étape par étape.' }
                ].map(tool => {
                  const isVisible = getToolVisible(tool.key);
                  return (
                    <GlassCard key={tool.key} style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: `4px solid ${isVisible ? 'var(--primary-color)' : '#94a3b8'}` }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Wrench size={16} />
                          {tool.name}
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem 0' }}>{tool.desc}</p>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.8rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: isVisible ? '#10b981' : '#64748b' }}>
                          {isVisible ? 'Visible sur le site' : 'Masqué'}
                        </span>
                        
                        <button
                          onClick={() => toggleToolVisible(tool.key)}
                          style={{
                            padding: '0.4rem 1rem',
                            borderRadius: '30px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '0.8rem',
                            backgroundColor: isVisible ? '#10b981' : '#64748b',
                            color: 'white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s'
                          }}
                        >
                          {isVisible ? 'Désactiver' : 'Activer'}
                        </button>
                      </div>
                    </GlassCard>
                  );
                })}

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
