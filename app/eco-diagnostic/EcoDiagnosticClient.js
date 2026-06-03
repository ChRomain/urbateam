'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Loader, 
  ShieldAlert, 
  Droplets, 
  Building2, 
  Activity, 
  Download, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import GlassCard from '../../components/GlassCard';
import { useLanguage } from '../../context/LanguageContext';
import 'leaflet/dist/leaflet.css';
import styles from './EcoDiagnosticClient.module.css';

import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap, useMapEvents } from 'react-leaflet';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';
import { supabase } from '../../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Fix pour les icônes par défaut de Leaflet
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Helper pour centrer la carte
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

// Clics sur la carte
function MapEventsHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    }
  });
  return null;
}

// Barycentre d'un polygone
function getPolygonCentroid(geometry) {
  if (!geometry) return [48.3903, -4.4861]; // Brest
  let latSum = 0;
  let lonSum = 0;
  let count = 0;
  
  const extractCoords = (coords) => {
    if (typeof coords[0] === 'number') {
      lonSum += coords[0];
      latSum += coords[1];
      count++;
    } else {
      coords.forEach(extractCoords);
    }
  };
  
  extractCoords(geometry.coordinates);
  if (count === 0) return [48.3903, -4.4861];
  return [latSum / count, lonSum / count];
}

function formatDataSource(t, source) {
  if (!source || source === 'centroid') return null;
  if (source === 'buffer_50m') {
    return t('eco.source_buffer') || 'Zone analysée : parcelle et alentours (~50 m)';
  }
  return t('eco.source_nearby') || 'Donnée obtenue sur un point voisin de la parcelle';
}

function scoreFromClayClasse(classe) {
  if (!classe) return null;
  if (classe === 'Fort') return 60;
  if (classe === 'Moyen') return 85;
  if (classe === 'Faible' || classe === 'Nul') return 100;
  return null;
}

function scoreFromRiskLabel(label) {
  if (!label) return null;
  const low = label.toLowerCase();
  if (low.includes('important') || low.includes('fort') || low.includes('élevé') || low.includes('eleve')) return 50;
  if (low.includes('moyen') || low.includes('modéré') || low.includes('modere')) return 70;
  if (low.includes('faible') || low.includes('très faible') || low.includes('tres faible')) return 90;
  return null;
}

function computeDiagnosisScores(ecoData) {
  if (!ecoData) return null;

  let soilParts = [];
  const clayScore = scoreFromClayClasse(ecoData.clayClasse);
  if (clayScore !== null) soilParts.push(clayScore);
  const seismeScore = scoreFromRiskLabel(ecoData.seisme);
  if (seismeScore !== null) soilParts.push(seismeScore);
  const radonScore = scoreFromRiskLabel(ecoData.radon);
  if (radonScore !== null) soilParts.push(radonScore);
  const soil =
    soilParts.length > 0
      ? Math.max(10, Math.min(100, Math.round(soilParts.reduce((a, b) => a + b, 0) / soilParts.length)))
      : null;

  let water = null;
  if (!ecoData.georisquesUnavailable) {
    const waterParts = [];
    const inondScore = scoreFromRiskLabel(ecoData.inundation);
    const nappeScore = scoreFromRiskLabel(ecoData.nappe);
    if (inondScore !== null) waterParts.push(inondScore);
    if (nappeScore !== null) waterParts.push(nappeScore);
    if (waterParts.length > 0) {
      water = Math.max(10, Math.min(100, Math.round(waterParts.reduce((a, b) => a + b, 0) / waterParts.length)));
    }
  }

  let heritageParts = [];
  if (!ecoData.monumentsUnavailable) {
    if (ecoData.monumentsNoneInRadius) {
      heritageParts.push(100);
    } else if (ecoData.monumentDist != null) {
      let h = 100;
      if (ecoData.monumentDist < 500) h -= (500 - ecoData.monumentDist) * 0.15;
      heritageParts.push(Math.max(10, Math.min(100, Math.round(h))));
    }
  }
  if (!ecoData.naturaUnavailable) {
    heritageParts.push(ecoData.naturaSites?.length > 0 ? 70 : 100);
  }
  const heritage =
    heritageParts.length > 0
      ? Math.max(10, Math.min(100, Math.round(heritageParts.reduce((a, b) => a + b, 0) / heritageParts.length)))
      : null;

  const axisScores = [soil, water, heritage].filter((v) => v !== null);
  const overall =
    axisScores.length > 0
      ? Math.round(axisScores.reduce((a, b) => a + b, 0) / axisScores.length)
      : null;

  return { soil, water, heritage, overall };
}

function DataIndicator({ label, unavailable, empty, value, unavailableText, emptyText, hint, sourceNote }) {
  const valueClass =
    unavailable || empty
      ? styles.statusMuted
      : hint === 'danger'
        ? styles.statusDanger
        : hint === 'warning'
          ? styles.statusWarning
          : styles.statusSuccess;

  let displayValue = value;
  if (unavailable) displayValue = unavailableText;
  else if (empty) displayValue = emptyText;

  return (
    <div className={styles.indicatorCard}>
      <span className={styles.indicatorLabel}>{label}</span>
      <span className={`${styles.indicatorValue} ${valueClass}`}>{displayValue}</span>
      {hint && !unavailable && !empty && typeof hint === 'string' && (
        <span className={styles.indicatorStatus}>{hint}</span>
      )}
      {sourceNote && !unavailable && !empty && (
        <span className={styles.indicatorStatus}>{sourceNote}</span>
      )}
    </div>
  );
}

export default function EcoDiagnosticClient() {
  const { t } = useLanguage();
  
  // États de recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [apiError, setApiError] = useState(false);
  
  // États cartographiques & Cadastre
  const [mapCenter, setMapCenter] = useState([48.3903, -4.4861]); // Brest par défaut
  const [zoomLevel, setZoomLevel] = useState(9);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [cadastreGeoJson, setCadastreGeoJson] = useState(null);
  const [cadastreInfo, setCadastreInfo] = useState(null);
  const [loadingCadastre, setLoadingCadastre] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [centroid, setCentroid] = useState(null);

  // Données issues exclusivement des APIs publiques (null = non chargé)
  const [ecoData, setEcoData] = useState(null);

  // Onglet actif pour les fiches de risques
  const [activeTab, setActiveTab] = useState('soil');

  // Formulaire de lead
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientMessage, setClientMessage] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState('');

  const autocompleteRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recherche d'adresses (Proxy API locale)
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      setApiError(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoadingSuggestions(true);
      setApiError(false);
      try {
        const response = await fetch(`/api/cadastre?action=search&q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.features || []);
        } else {
          setSuggestions([]);
          setApiError(true);
        }
      } catch (err) {
        console.error('Erreur appel API Adresse :', err);
        setSuggestions([]);
        setApiError(true);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Chargement de la parcelle
  const loadParcelDetails = async (lat, lon, label) => {
    setSelectedAddress(label);
    setSearchQuery(label);
    setShowSuggestions(false);
    setMapCenter([lat, lon]);
    setZoomLevel(18);
    setCadastreGeoJson(null);
    setCadastreInfo(null);
    setCentroid(null);
    setEcoData(null);
    setErrorMsg('');
    setLoadingCadastre(true);
    setLeadSuccess(false);

    try {
      const cadastreRes = await fetch(`/api/cadastre?action=parcel&lat=${lat}&lon=${lon}`);

      if (cadastreRes.ok) {
        const cadastreData = await cadastreRes.json();
        
        if (cadastreData.features && cadastreData.features.length > 0) {
          const parcelFeature = cadastreData.features[0];
          setCadastreGeoJson(parcelFeature.geometry);
          
          const props = parcelFeature.properties;
          setCadastreInfo({
            numero: props.numero ?? null,
            section: props.section ?? null,
            code_commune: props.code_insee ?? null,
            commune: props.nom_com ?? null,
            surface: props.contenance ?? null,
          });

          const center = getPolygonCentroid(parcelFeature.geometry);
          setCentroid(center);
          setMapCenter(center);

          const geomParam = encodeURIComponent(JSON.stringify(parcelFeature.geometry));
          const ecoRes = await fetch(
            `/api/eco-diagnostic?lat=${center[0]}&lon=${center[1]}&geom=${geomParam}`
          );
          const ecoJson = await ecoRes.json().catch(() => ({}));
          if (!ecoRes.ok || ecoJson.fetchError) {
            setEcoData({
              unavailableServices: ecoJson.unavailableServices || [
                'Services publics (Géorisques, IGN, Culture)',
              ],
              clayUnavailable: true,
              georisquesUnavailable: true,
              monumentsUnavailable: true,
              pluUnavailable: true,
              naturaUnavailable: true,
              altiUnavailable: true,
            });
          } else {
            setEcoData(ecoJson);
          }
        } else {
          setErrorMsg('cadastre.error_no_parcel');
        }
      } else {
        setErrorMsg('cadastre.error_ign_down');
      }
    } catch (err) {
      console.error('Erreur API Cadastre :', err);
      setErrorMsg('cadastre.error_connection');
    } finally {
      setLoadingCadastre(false);
    }
  };

  const handleSelectAddress = (feature) => {
    const coords = feature.geometry.coordinates; // [lon, lat]
    loadParcelDetails(coords[1], coords[0], feature.properties.label);
  };

  const handleMapClick = async (latlng) => {
    const lat = latlng.lat;
    const lon = latlng.lng;
    
    let reverseLabel = `Point sélectionné : ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    try {
      const reverseRes = await fetch(`/api/cadastre?action=reverse&lat=${lat}&lon=${lon}`);
      if (reverseRes.ok) {
        const reverseData = await reverseRes.json();
        if (reverseData.features && reverseData.features.length > 0) {
          reverseLabel = reverseData.features[0].properties.label;
        }
      }
    } catch (e) {
      console.warn("Reverse geocoding failed", e);
    }

    loadParcelDetails(lat, lon, reverseLabel);
  };

  const diagnosisScores = useMemo(() => computeDiagnosisScores(ecoData), [ecoData]);

  const unavailableText =
    t('eco.api_unreachable') || "Pas d'information sur la zone (service indisponible)";
  const noDataText =
    t('eco.no_data_zone') ||
    'Aucune donnée sur la parcelle ni dans les alentours immédiats (~50 m)';
  const apiBannerText =
    t('eco.api_unavailable_banner') ||
    "Pas d'information sur la zone pour les services suivants (API publiques injoignables) :";

  // Formater les données pour le Radar Chart de Recharts (Triangle Sol, Eau, Patrimoine)
  const chartData = useMemo(() => {
    if (!diagnosisScores) return [];
    const axes = [
      { subject: t('eco.axes.soil') || 'Sol & Risques', value: diagnosisScores.soil },
      { subject: t('eco.axes.water') || 'Eau & Inondations', value: diagnosisScores.water },
      { subject: t('eco.axes.heritage') || 'Urbanisme & Patrimoine', value: diagnosisScores.heritage },
    ];
    return axes
      .filter((a) => a.value !== null)
      .map((a) => ({ subject: a.subject, A: a.value, fullMark: 100 }));
  }, [diagnosisScores, t]);

  // Soumission du formulaire
  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (!clientName || !clientEmail) {
      setLeadError('Veuillez renseigner au moins votre nom et votre adresse e-mail.');
      return;
    }
    if (!cadastreInfo || !ecoData) return;

    setSubmittingLead(true);
    setLeadError('');

    try {
      const { error } = await supabase
        .from('eco_diagnostics')
        .insert([{
          address: selectedAddress,
          parcel_ref: [
            cadastreInfo.section && `Section ${cadastreInfo.section}`,
            cadastreInfo.numero && `n°${cadastreInfo.numero}`,
            cadastreInfo.commune,
          ].filter(Boolean).join(' ') || selectedAddress,
          surface: cadastreInfo.surface != null ? `${cadastreInfo.surface} m²` : null,
          overall_score: diagnosisScores?.overall ?? null,
          scores: {
            ...(diagnosisScores || {}),
            ecoData,
          },
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone || null,
          client_message: clientMessage || null
        }]);

      if (error) {
        throw new Error(error.message);
      }

      setLeadSuccess(true);
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setClientMessage('');
    } catch (err) {
      console.error('Erreur soumission eco-diag :', err);
      setLeadError("Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.");
    } finally {
      setSubmittingLead(false);
    }
  };

  // Génération du rapport PDF haut de gamme avec jsPDF
  const generatePDFReport = () => {
    if (!cadastreInfo || !ecoData) return;

    const doc = new jsPDF();
    const primaryColor = [121, 160, 129]; // #79a081
    const secondaryColor = [60, 60, 60]; // #3c3c3c
    const accentColor = [214, 185, 159]; // #d6b99f

    // En-tête officiel
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');

    // Logo ou Titre de marque
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("URBATEAM", 15, 26);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text("GEOMETRES-EXPERTS - URBANISTES - INGENIERIE", 75, 25);

    // Titre du document
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text("RAPPORT D'ECO-DIAGNOSTIC FONCIER", 15, 55);

    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(1);
    doc.line(15, 60, 195, 60);

    // Références de la parcelle
    doc.setFontSize(11);
    doc.setFont("Helvetica", "bold");
    doc.text("Références cadastrales du terrain :", 15, 72);
    doc.setFont("Helvetica", "normal");
    doc.text(`- Adresse : ${selectedAddress}`, 15, 80);
    doc.text(`- Commune : ${cadastreInfo.commune}`, 15, 87);
    doc.text(`- Parcelle : Section ${cadastreInfo.section} n°${cadastreInfo.numero}`, 15, 94);
    if (cadastreInfo.surface != null) {
      doc.text(`- Surface Fiscale : ${cadastreInfo.surface} m²`, 15, 101);
    }

    let y = cadastreInfo.surface != null ? 110 : 101;

    if (ecoData.unavailableServices.length > 0) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(180, 80, 50);
      doc.text('API publiques non joignables :', 15, y);
      y += 6;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      ecoData.unavailableServices.forEach((svc) => {
        doc.text(`- ${svc}`, 18, y);
        y += 5;
      });
      y += 4;
    }

    if (diagnosisScores?.overall != null) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y, 180, 22, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, y, 180, 22, 'S');
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`SCORE INDICATIF (données disponibles) : ${diagnosisScores.overall} / 100`, 25, y + 14);
      y += 30;
    }

    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Données officielles recueillies", 15, y);
    y += 8;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    const lines = [];
    if (ecoData.clayClasse) lines.push(`Argiles (Géorisques) : ${ecoData.clayClasse}`);
    if (ecoData.seisme) lines.push(`Sismicité : ${ecoData.seisme}`);
    if (ecoData.radon) lines.push(`Radon : ${ecoData.radon}`);
    if (ecoData.inundation) lines.push(`Inondation : ${ecoData.inundation}`);
    if (ecoData.nappe) lines.push(`Nappe : ${ecoData.nappe}`);
    if (ecoData.altitude != null) lines.push(`Altitude IGN : ${ecoData.altitude} m`);
    if (ecoData.monumentsNoneInRadius) lines.push('Monuments historiques : aucun dans un rayon de 1 km');
    else if (ecoData.monumentDist != null) {
      lines.push(`Monument le plus proche : ${ecoData.monumentDist} m${ecoData.monumentName ? ` (${ecoData.monumentName})` : ''}`);
    }
    if (ecoData.pluZone) lines.push(`PLU : ${ecoData.pluZone}${ecoData.pluDesc ? ` — ${ecoData.pluDesc}` : ''}`);
    if (ecoData.naturaSites?.length) lines.push(`Natura 2000 : ${ecoData.naturaSites.join('; ')}`);
    if (ecoData.naturaNoneAtPoint) lines.push('Natura 2000 : aucun site à cette position');

    lines.forEach((line) => {
      const wrapped = doc.splitTextToSize(line, 175);
      doc.text(wrapped, 15, y);
      y += wrapped.length * 5;
    });

    if (diagnosisScores && chartData.length > 0) {
      const tableData = chartData.map((row) => [
        row.subject,
        `${row.A} / 100`,
        'Score indicatif (données partielles possibles)',
      ]);
      autoTable(doc, {
        startY: y + 5,
        head: [['Thématique', 'Note', 'Remarque']],
        body: tableData,
        headStyles: { fillColor: primaryColor },
        theme: 'striped',
        margin: { left: 15, right: 15 },
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Synthèse indicative à partir des API publiques de l'État. Seule l'intervention physique", 15, 275);
    doc.text("d'un Géomètre-Expert d'Urbateam sur site permet de dresser des plans officiels et un bornage juridiquement garanti.", 15, 279);
    doc.text(`Généré le ${new Date().toLocaleDateString()} - URBATEAM SARL`, 15, 283);

    const communeSlug = cadastreInfo.commune || 'parcelle';
    doc.save(`Eco_Diagnostic_Foncier_Urbateam_${communeSlug}.pdf`);
  };

  return (
    <div className="container py-section">
      <PageHeader 
        title={t("eco.title") || "Éco-Diagnostic Foncier"} 
        subtitle={t("eco.subtitle") || "Évaluez instantanément les contraintes écologiques et physiques de votre terrain."} 
      />

      {/* Intro interactif */}
      <div className={styles.introCard}>
        <GlassCard style={{ padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className={styles.introIcon}>
            <Sparkles size={22} color="var(--primary-color)" />
          </div>
          <div className={styles.introContent}>
            {!cadastreInfo ? (
              <span className={styles.introText}>
                <strong>Étape 1 :</strong> Recherchez votre adresse dans le panneau de gauche ou <strong>cliquez directement sur une parcelle</strong> de la carte interactive pour lancer le diagnostic.
              </span>
            ) : (
              <span className={styles.introText}>
                <strong>Parcelle identifiée.</strong> {t('eco.loaded_desc') || 'Les indicateurs ci-dessous proviennent des API publiques de l\'État lorsqu\'elles répondent ; les services injoignables sont signalés.'}
              </span>
            )}
          </div>
        </GlassCard>
      </div>

      <div className={styles.layout}>
        {/* Barre latérale (1/3) */}
        <div className={styles.sidebar}>
          
          {/* Recherche */}
          <GlassCard style={{ padding: '1.5rem', overflow: 'visible', zIndex: 100 }}>
            <h3 className={styles.searchHeader}>
              <Search size={18} color="var(--accent-color)" />
              {t("eco.search_address") || "Saisir une adresse"}
            </h3>
            
            <div ref={autocompleteRef} className={styles.searchInputWrapper}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder="Ex: 10 Joseph le Velly, Saint-Renan"
                className={styles.searchInput}
              />
              <span className={styles.searchIcon}>
                {loadingSuggestions ? <Loader size={18} className="spin" /> : <MapPin size={18} />}
              </span>

              {/* Suggestions */}
              <AnimatePresence>
                {showSuggestions && (suggestions.length > 0 || apiError) && (
                  <motion.ul 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={styles.suggestionsList}
                  >
                    {apiError ? (
                      <li style={{ padding: '0.8rem 1rem', color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={14} />
                        Service indisponible
                      </li>
                    ) : (
                      suggestions.map((feature, idx) => (
                        <li 
                          key={idx}
                          onClick={() => handleSelectAddress(feature)}
                          className={styles.suggestionItem}
                        >
                          <MapPin size={14} color="var(--primary-color)" />
                          {feature.properties.label}
                        </li>
                      ))
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>

          {/* États Dynamiques */}
          <AnimatePresence mode="wait">
            {loadingCadastre ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <GlassCard className={styles.loadingCard}>
                  <Loader size={40} className="spin" color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
                  <span className={styles.loadingText}>{t("eco.loading_text") || "Calcul des données foncières..."}</span>
                </GlassCard>
              </motion.div>
            ) : errorMsg ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <GlassCard className={styles.errorCard} style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                  <AlertTriangle size={32} color="#ef4444" style={{ marginBottom: '0.8rem' }} />
                  <h4 style={{ color: '#ef4444', fontWeight: 'bold' }}>Aucune parcelle trouvée</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
                    Le cadastre n'a renvoyé aucune parcelle à cette position. Essayez de cliquer plus précisément sur la carte.
                  </p>
                </GlassCard>
              </motion.div>
            ) : cadastreInfo && ecoData ? (
              <motion.div
                key="dashboard-sidebar"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={styles.sidebar}
              >
                {/* Formulaire de Lead */}
                <GlassCard style={{ padding: '1.5rem' }}>
                  {leadSuccess ? (
                    <div className={styles.successCard}>
                      <div className={styles.successTitle}>
                        <CheckCircle size={20} /> {t("eco.registered") || "Diagnostic transmis !"}
                      </div>
                      <p className={styles.successText}>
                        {t("eco.registered_desc") || "Votre demande a bien été enregistrée. Un Géomètre-Expert Urbateam analysera le dossier."}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitLead}>
                      <h4 className={styles.formTitle}>
                        <FileText size={18} color="var(--primary-color)" />
                        {t("eco.lead_title") || "Étude officielle d'expert"}
                      </h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', lineHeight: '1.4', marginBottom: '1rem' }}>
                        {t("eco.lead_desc") || "Envoyez cet éco-diagnostic à notre cabinet pour qu'un Géomètre-Expert valide sa faisabilité d'urbanisme."}
                      </p>

                      <input
                        type="text"
                        placeholder="Votre nom complet *"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className={styles.formInput}
                        required
                      />
                      <input
                        type="email"
                        placeholder="Adresse e-mail *"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className={styles.formInput}
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Téléphone (optionnel)"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className={styles.formInput}
                      />
                      <textarea
                        placeholder="Détails de votre projet de construction ou d'aménagement..."
                        value={clientMessage}
                        onChange={(e) => setClientMessage(e.target.value)}
                        className={styles.formTextarea}
                      />

                      {leadError && (
                        <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '0.8rem' }}>{leadError}</p>
                      )}

                      <button
                        type="submit"
                        disabled={submittingLead}
                        className="btn btn-primary"
                        style={{ width: '100%', textTransform: 'none', fontSize: '0.85rem' }}
                      >
                        {submittingLead ? 'Envoi en cours...' : (t('eco.free_study') || "Faire valider par Urbateam")}
                      </button>
                    </form>
                  )}
                </GlassCard>

                {/* Exporter PDF */}
                <button 
                  className="btn btn-outline" 
                  onClick={generatePDFReport} 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Download size={16} />
                  {t("eco.download_report") || "Générer le Rapport PDF"}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className={styles.emptyCard}>
                  <div className={styles.emptyIconWrapper}>
                    <ShieldAlert size={26} />
                  </div>
                  <h4 className={styles.emptyTitle}>Prêt pour le diagnostic</h4>
                  <p className={styles.emptyText}>
                    Recherchez un terrain par son adresse ou cliquez directement sur le cadastre pour voir s'afficher l'analyse écologique.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bloc principal (Carte + Graphique Radar 2/3) */}
        <div className={styles.dashboardContent}>
          {ecoData?.unavailableServices?.length > 0 && (
            <GlassCard className={styles.apiWarningBanner}>
              <AlertTriangle size={18} />
              <div>
                <strong>{apiBannerText}</strong>
                <ul className={styles.apiWarningList}>
                  {ecoData.unavailableServices.map((svc) => (
                    <li key={svc}>{svc}</li>
                  ))}
                </ul>
              </div>
            </GlassCard>
          )}

          {cadastreInfo && ecoData && diagnosisScores?.overall != null && (
            <div className={styles.scoreBanner}>
              <div className={styles.scoreCircle}>
                {diagnosisScores.overall}
              </div>
              <div className={styles.scoreTextContainer}>
                <h3 className={styles.scoreTitle}>
                  {t('eco.overall_score') || "Score indicatif de viabilité"}
                </h3>
                <p className={styles.scoreDesc}>
                  {t('eco.overall_desc_partial') || "Calculé uniquement à partir des indicateurs effectivement retournés par les API publiques."}
                </p>
              </div>
            </div>
          )}

          <div className={styles.mainPanelGrid}>
            {/* Carte Leaflet */}
            <div className={styles.mapContainerWrapper}>
              <MapContainer 
                center={mapCenter} 
                zoom={zoomLevel} 
                style={{ height: '100%', width: '100%', zIndex: 10 }}
                scrollWheelZoom={true}
                attributionControl={false}
              >
                <ChangeView center={mapCenter} zoom={zoomLevel} />
                <MapEventsHandler onMapClick={handleMapClick} />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
                />
                
                {/* Couche transparent Cadastre */}
                <TileLayer
                  url="https://tms.cadastral.openstreetmap.fr/tms/1.0.0/parcel/{z}/{x}/{y}.png"
                  tms={true}
                  opacity={0.4}
                />

                {/* GeoJSON de la parcelle */}
                {cadastreGeoJson && (
                  <GeoJSON
                    key={JSON.stringify(cadastreGeoJson)}
                    data={cadastreGeoJson}
                    style={{
                      color: 'var(--primary-color)',
                      weight: 3,
                      fillColor: 'var(--primary-color)',
                      fillOpacity: 0.2,
                      dashArray: '4, 4'
                    }}
                  />
                )}

                {/* Marqueur principal */}
                {selectedAddress && (
                  <Marker position={mapCenter}>
                    <Popup>
                      <div style={{ padding: '4px', fontSize: '0.8rem' }}>
                        <strong>Adresse sélectionnée :</strong>
                        <p style={{ margin: '3px 0 0 0' }}>{selectedAddress}</p>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>

            {/* Radar Chart Recharts */}
            <div className={styles.chartContainerWrapper}>
              <h4 className={styles.chartTitle}>
                {t('eco.radar_title') || "Bilan thématique multicritères"}
              </h4>
              
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart cx="50%" cy="50%" radius="45%" data={chartData} margin={{ top: 10, right: 35, bottom: 10, left: 35 }}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: 'var(--text-main)', fontSize: 11, fontWeight: 600 }} 
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={{ fill: 'var(--text-light)', fontSize: 9 }}
                    />
                    <Radar
                      name="Parcelle"
                      dataKey="A"
                      stroke="var(--primary-color)"
                      fill="var(--primary-color)"
                      fillOpacity={0.35}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', padding: '3rem 1rem' }}>
                  <HelpCircle size={32} style={{ marginBottom: '0.8rem', opacity: 0.5 }} />
                  {ecoData
                    ? (t('eco.radar_insufficient') || 'Graphique non disponible : données API insuffisantes pour calculer les scores.')
                    : (t('eco.radar_empty') || 'Sélectionnez une parcelle pour afficher le graphique.')}
                </div>
              )}
            </div>
          </div>

          {/* Note explicative & simulation */}
          {cadastreInfo && (
            <GlassCard style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '4px solid var(--accent-color)' }}>
              <div>
                <h4 style={{ fontFamily: 'var(--font-righteous), sans-serif', color: 'var(--secondary-color)', fontSize: '1rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="var(--primary-color)" />
                  {t('eco.how_it_works_title') || "Comment ce diagnostic est-il calculé ?"}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                  {t('eco.how_it_works_desc')}
                </p>
              </div>
              <div style={{ marginTop: '5px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1' }}>
                <h5 style={{ fontWeight: '700', color: 'var(--secondary-color)', fontSize: '0.82rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={14} color="var(--accent-color)" />
                  {t('eco.simulation_note_title') || "Note importante : Simulation indicative"}
                </h5>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', lineHeight: '1.5' }}>
                  {t('eco.simulation_note_desc')}
                </p>
              </div>
            </GlassCard>
          )}

          {/* Fiches de risques interactives (Tabs) */}
          {cadastreInfo && ecoData && (
            <div>
              <div className={styles.tabsContainer}>
                <button 
                  className={`${styles.tabButton} ${activeTab === 'soil' ? styles.tabButtonActive : ''}`}
                  onClick={() => setActiveTab('soil')}
                >
                  <Activity size={14} />
                  {t('eco.axes.soil') || 'Sol & Risques'}
                </button>
                <button 
                  className={`${styles.tabButton} ${activeTab === 'water' ? styles.tabButtonActive : ''}`}
                  onClick={() => setActiveTab('water')}
                >
                  <Droplets size={14} />
                  {t('eco.axes.water') || "Gestion de l'Eau"}
                </button>
                <button 
                  className={`${styles.tabButton} ${activeTab === 'heritage' ? styles.tabButtonActive : ''}`}
                  onClick={() => setActiveTab('heritage')}
                >
                  <Building2 size={14} />
                  {t('eco.axes.heritage') || "Patrimoine & Règles"}
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={styles.tabContent}
                >
                  {activeTab === 'soil' && (
                    <div>
                      <div className={styles.tabHeader}>
                        <Activity size={20} color="var(--primary-color)" />
                        <h3 className={styles.tabTitle}>{t('eco.soil.title') || "Sol & Risques géologiques"}</h3>
                      </div>
                      <p className={styles.tabDescription}>{t('eco.soil.desc') || "Évaluation de la stabilité des fondations."}</p>
                      
                      <div className={styles.tabGrid}>
                        <DataIndicator
                          label={t('eco.soil.clay_level') || 'Retrait-gonflement des argiles (Géorisques)'}
                          unavailable={ecoData.clayUnavailable}
                          empty={ecoData.clayNoData}
                          value={ecoData.clayClasse}
                          unavailableText={unavailableText}
                          emptyText={noDataText}
                          sourceNote={formatDataSource(t, ecoData.claySource)}
                          hint={ecoData.clayClasse === 'Fort' ? 'danger' : ecoData.clayClasse === 'Moyen' ? 'warning' : ecoData.clayClasse ? 'success' : undefined}
                        />
                        <DataIndicator
                          label={t('eco.soil.seismic') || 'Sismicité (Géorisques)'}
                          unavailable={ecoData.georisquesUnavailable}
                          empty={!ecoData.georisquesUnavailable && (ecoData.georisquesNoData || !ecoData.seisme)}
                          value={ecoData.seisme}
                          unavailableText={unavailableText}
                          emptyText={noDataText}
                          sourceNote={formatDataSource(t, ecoData.georisquesSource)}
                          hint={ecoData.seisme ? (ecoData.seisme.toLowerCase().includes('fort') || ecoData.seisme.toLowerCase().includes('moyen') ? 'warning' : 'success') : undefined}
                        />
                        <DataIndicator
                          label={t('eco.soil.radon') || 'Risque radon (Géorisques)'}
                          unavailable={ecoData.georisquesUnavailable}
                          empty={!ecoData.georisquesUnavailable && (ecoData.georisquesNoData || !ecoData.radon)}
                          value={ecoData.radon}
                          unavailableText={unavailableText}
                          emptyText={noDataText}
                          sourceNote={formatDataSource(t, ecoData.georisquesSource)}
                          hint={ecoData.radon ? (ecoData.radon.toLowerCase().includes('important') || ecoData.radon.toLowerCase().includes('fort') ? 'danger' : 'success') : undefined}
                        />
                        <DataIndicator
                          label={t('eco.soil.altitude') || 'Altitude au point (IGN)'}
                          unavailable={ecoData.altiUnavailable}
                          empty={!ecoData.altiUnavailable && ecoData.altitude == null}
                          value={ecoData.altitude != null ? `${ecoData.altitude} m` : null}
                          unavailableText={unavailableText}
                          emptyText={noDataText}
                          sourceNote={formatDataSource(t, ecoData.altiSource)}
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'water' && (
                    <div>
                      <div className={styles.tabHeader}>
                        <Droplets size={20} color="var(--primary-color)" />
                        <h3 className={styles.tabTitle}>{t('eco.water.title') || "Gestion de l'Eau & Hydrologie"}</h3>
                      </div>
                      <p className={styles.tabDescription}>{t('eco.water.desc') || "Analyse du risque inondation."}</p>
                      
                      <div className={styles.tabGrid}>
                        <DataIndicator
                          label={t('eco.water.flood') || 'Inondation (Géorisques)'}
                          unavailable={ecoData.georisquesUnavailable}
                          empty={!ecoData.georisquesUnavailable && (ecoData.georisquesNoData || !ecoData.inundation)}
                          value={ecoData.inundation}
                          unavailableText={unavailableText}
                          emptyText={noDataText}
                          sourceNote={formatDataSource(t, ecoData.georisquesSource)}
                        />
                        <DataIndicator
                          label={t('eco.water.groundwater') || 'Remontée de nappe (Géorisques)'}
                          unavailable={ecoData.georisquesUnavailable}
                          empty={!ecoData.georisquesUnavailable && (ecoData.georisquesNoData || !ecoData.nappe)}
                          value={ecoData.nappe}
                          unavailableText={unavailableText}
                          emptyText={noDataText}
                          sourceNote={formatDataSource(t, ecoData.georisquesSource)}
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'heritage' && (
                    <div>
                      <div className={styles.tabHeader}>
                        <Building2 size={20} color="var(--primary-color)" />
                        <h3 className={styles.tabTitle}>{t('eco.heritage.title') || "Patrimoine & Règles administratives"}</h3>
                      </div>
                      <p className={styles.tabDescription}>{t('eco.heritage.desc') || "Périmètres règlementaires."}</p>
                      
                      <div className={styles.tabGrid}>
                        <DataIndicator
                          label={t('eco.heritage.monuments') || 'Monument historique le plus proche (1 km)'}
                          unavailable={ecoData.monumentsUnavailable}
                          empty={
                            !ecoData.monumentsUnavailable &&
                            !ecoData.monumentsNoneInRadius &&
                            ecoData.monumentDist == null &&
                            !ecoData.monumentName
                          }
                          value={
                            ecoData.monumentsNoneInRadius
                              ? (t('eco.no_monument_1km') || 'Aucun monument répertorié dans un rayon de 1 km')
                              : ecoData.monumentDist != null
                                ? `${ecoData.monumentDist} m${ecoData.monumentName ? ` — ${ecoData.monumentName}` : ''}`
                                : ecoData.monumentName
                                  ? ecoData.monumentName
                                  : null
                          }
                          unavailableText={unavailableText}
                          emptyText={noDataText}
                          hint={
                            ecoData.monumentDist != null && ecoData.monumentDist < 500 ? 'warning' : ecoData.monumentsNoneInRadius ? 'success' : undefined
                          }
                        />
                        <DataIndicator
                          label={t('eco.heritage.plu') || 'Zonage PLU (GPU)'}
                          unavailable={ecoData.pluUnavailable}
                          empty={ecoData.pluNoZoneAtPoint}
                          value={ecoData.pluZone ? `${ecoData.pluZone}${ecoData.pluDesc ? ` — ${ecoData.pluDesc}` : ''}` : null}
                          unavailableText={unavailableText}
                          emptyText={noDataText}
                          sourceNote={formatDataSource(t, ecoData.pluSource)}
                        />
                        <DataIndicator
                          label={t('eco.heritage.natura2000') || 'Natura 2000 (IGN)'}
                          unavailable={ecoData.naturaUnavailable}
                          empty={ecoData.naturaNoneAtPoint}
                          value={ecoData.naturaSites?.length ? ecoData.naturaSites.join(' ; ') : null}
                          unavailableText={unavailableText}
                          emptyText={noDataText}
                          sourceNote={formatDataSource(t, ecoData.naturaSource)}
                          hint={ecoData.naturaSites?.length ? 'warning' : undefined}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <div className={styles.simulatorNote}>
        <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
        <p>{t('eco.simulator_note')}</p>
      </div>
    </div>
  );
}
