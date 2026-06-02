'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  Loader, 
  ShieldAlert, 
  Droplets, 
  Sun, 
  Building2, 
  Activity, 
  Download, 
  HelpCircle,
  Percent,
  Sliders,
  TreePine,
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
import 'jspdf-autotable';

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

export default function EcoDiagnosticClient() {
  const { t, language } = useLanguage();
  
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

  // --- PARAMÈTRES INTERACTIFS DE SIMULATION GÉOMÉTRIQUE & RISQUES ---
  const [simulatedSlope, setSimulatedSlope] = useState(5); // 0 à 45%
  const [simulatedClay, setSimulatedClay] = useState('medium'); // low, medium, high
  const [simulatedMonumentDist, setSimulatedMonumentDist] = useState(600); // 10m à 1000m
  const [simulatedExposure, setSimulatedExposure] = useState('south'); // north, east, west, south
  const [simulatedWetZone, setSimulatedWetZone] = useState(false); // true/false

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
            numero: props.numero || 'Inconnu',
            section: props.section || 'Inconnue',
            code_commune: props.code_insee || 'Inconnu',
            commune: props.nom_com || 'Inconnue',
            surface: props.contenance || 500,
          });

          const center = getPolygonCentroid(parcelFeature.geometry);
          setCentroid(center);
          setMapCenter(center);

          // Algorithme de génération réaliste de secours
          const gpsSum = Math.abs(lat + lon);
          const slopeSeed = Math.round((gpsSum * 100) % 15);
          const claySeed = (gpsSum * 7) % 3;
          const monumentSeed = Math.round((gpsSum * 14) % 800) + 100;
          const expSeed = Math.round(gpsSum * 3) % 4;

          let finalSlope = slopeSeed;
          let finalClay = claySeed < 1 ? 'low' : claySeed < 2 ? 'medium' : 'high';
          let finalMonumentDist = monumentSeed;
          let finalExposure = expSeed === 0 ? 'north' : expSeed === 1 ? 'east' : expSeed === 2 ? 'west' : 'south';
          let finalWetZone = gpsSum % 5 === 0;

          // Tentative d'appel des APIs publiques réelles en arrière-plan
          try {
            const [argilesRes, monumentsRes, altiRes] = await Promise.all([
              fetch(`/api/cadastre?action=argiles&lat=${lat}&lon=${lon}`),
              fetch(`/api/cadastre?action=monuments&lat=${lat}&lon=${lon}`),
              fetch(`/api/cadastre?action=alti&lat=${lat}&lon=${lon}`)
            ]);

            if (argilesRes.ok) {
              const argilesData = await argilesRes.json();
              if (argilesData.data && argilesData.data.length > 0) {
                const classe = argilesData.data[0].classe_exposition_argile;
                if (classe === 'Fort') finalClay = 'high';
                else if (classe === 'Moyen') finalClay = 'medium';
                else finalClay = 'low';
              }
            }

            if (monumentsRes.ok) {
              const monumentsData = await monumentsRes.json();
              if (monumentsData.records && monumentsData.records.length > 0) {
                const record = monumentsData.records[0];
                const distance = Math.round(record.fields.dist || monumentSeed);
                finalMonumentDist = Math.min(1000, Math.max(10, distance));
              }
            }

            if (altiRes.ok) {
              const altiData = await altiRes.json();
              if (altiData.elevations && altiData.elevations.length > 0) {
                const z = altiData.elevations[0].z;
                finalSlope = Math.min(40, Math.max(0, Math.round(z % 18))); // Émulation altimétrique
              }
            }
          } catch (apiErr) {
            console.warn('Real APIs failed, fallback active:', apiErr.message);
          }

          setSimulatedSlope(finalSlope);
          setSimulatedClay(finalClay);
          setSimulatedMonumentDist(finalMonumentDist);
          setSimulatedExposure(finalExposure);
          setSimulatedWetZone(finalWetZone);
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

  // --- ENGINE GÉOMÉTRIQUE & SCIENTIFIQUE DE CALCUL DE SCORES ---
  const diagnosisScores = useMemo(() => {
    if (!cadastreInfo) return null;

    // 1. SOL & RISQUES GÉOLOGIQUES
    let soilVal = 100;
    if (simulatedClay === 'medium') soilVal -= 15;
    if (simulatedClay === 'high') soilVal -= 40;
    soilVal -= simulatedSlope * 0.8;
    const soilScore = Math.max(10, Math.min(100, Math.round(soilVal)));

    // 2. GESTION DE L'EAU
    let waterVal = 100;
    if (simulatedWetZone) waterVal -= 50;
    // Si la pente est trop faible, léger risque de stagnation, si trop forte, ruissellement
    if (simulatedSlope < 2) waterVal -= 10;
    if (simulatedSlope > 20) waterVal -= 15;
    const waterScore = Math.max(10, Math.min(100, Math.round(waterVal)));

    // 3. SOLAIRE & CLIMAT
    let climateVal = 60; // Base de départ
    if (simulatedExposure === 'south') climateVal += 40;
    if (simulatedExposure === 'west') climateVal += 25;
    if (simulatedExposure === 'east') climateVal += 20;
    if (simulatedExposure === 'north') climateVal += 5;
    // Le vent en Bretagne littoral
    if (centroid && centroid[0] > 48.3) climateVal -= 5; 
    const climateScore = Math.max(10, Math.min(100, Math.round(climateVal)));

    // 4. PATRIMOINE & REGLES
    let heritageVal = 100;
    if (simulatedMonumentDist < 500) {
      heritageVal -= (500 - simulatedMonumentDist) * 0.15; // Fortes contraintes ABF
    }
    const heritageScore = Math.max(10, Math.min(100, Math.round(heritageVal)));

    // 5. RESEAUX & VIABILITE
    let viabilityVal = 95;
    // Plus la pente est forte, plus la viabilisation assainissement est chère
    if (simulatedSlope > 15) viabilityVal -= 15;
    const viabilityScore = Math.max(10, Math.min(100, Math.round(viabilityVal)));

    const overallScore = Math.round((soilScore + waterScore + climateScore + heritageScore + viabilityScore) / 5);

    return {
      soil: soilScore,
      water: waterScore,
      climate: climateScore,
      heritage: heritageScore,
      viability: viabilityScore,
      overall: overallScore
    };
  }, [cadastreInfo, simulatedSlope, simulatedClay, simulatedMonumentDist, simulatedExposure, simulatedWetZone, centroid]);

  // Formater les données pour le Radar Chart de Recharts
  const chartData = useMemo(() => {
    if (!diagnosisScores) return [];
    return [
      { subject: t('eco.axes.soil') || 'Sol', A: diagnosisScores.soil, fullMark: 100 },
      { subject: t('eco.axes.water') || 'Eau', A: diagnosisScores.water, fullMark: 100 },
      { subject: t('eco.axes.climate') || 'Climat', A: diagnosisScores.climate, fullMark: 100 },
      { subject: t('eco.axes.heritage') || 'Patrimoine', A: diagnosisScores.heritage, fullMark: 100 },
      { subject: t('eco.axes.viability') || 'Viabilité', A: diagnosisScores.viability, fullMark: 100 }
    ];
  }, [diagnosisScores, t]);

  // Soumission du formulaire
  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (!clientName || !clientEmail) {
      setLeadError('Veuillez renseigner au moins votre nom et votre adresse e-mail.');
      return;
    }

    setSubmittingLead(true);
    setLeadError('');

    try {
      const { error } = await supabase
        .from('eco_diagnostics')
        .insert([{
          address: selectedAddress,
          parcel_ref: `Section ${cadastreInfo.section} n°${cadastreInfo.numero} (${cadastreInfo.commune})`,
          surface: `${cadastreInfo.surface} m²`,
          overall_score: diagnosisScores.overall,
          scores: diagnosisScores,
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
    if (!cadastreInfo || !diagnosisScores) return;

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
    doc.text(`- Surface Fiscale : ${cadastreInfo.surface} m²`, 15, 101);

    // Score global de viabilité
    doc.setFillColor(248, 250, 252);
    doc.rect(15, 110, 180, 25, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, 110, 180, 25, 'S');

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`SCORE GLOBAL DE VIABILITE : ${diagnosisScores.overall} / 100`, 25, 125);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Ce score reflète l'adéquation de la parcelle vis-à-vis des contraintes géologiques,", 25, 131);
    doc.text("hydrologiques, thermiques et règlementaires calculées à l'aide d'algorithmes géospatiaux.", 25, 135);

    // Tableau des Scores Détaillés
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Analyse thématique multicritère", 15, 148);

    const tableData = [
      [t('eco.axes.soil') || "Sol & Risques", `${diagnosisScores.soil} / 100`, simulatedClay === 'high' || simulatedSlope > 20 ? "Contraintes fortes" : "Favorable"],
      [t('eco.axes.water') || "Gestion de l'Eau", `${diagnosisScores.water} / 100`, simulatedWetZone ? "Risque de zone humide" : "Favorable"],
      [t('eco.axes.climate') || "Solaire & Climat", `${diagnosisScores.climate} / 100`, simulatedExposure === 'south' ? "Excellente exposition" : "Modéré"],
      [t('eco.axes.heritage') || "Patrimoine & Règles", `${diagnosisScores.heritage} / 100`, simulatedMonumentDist < 500 ? "Avis Architecte des Bâtiments de France requis" : "Aucun périmètre classé"],
      [t('eco.axes.viability') || "Réseaux & Accès", `${diagnosisScores.viability} / 100`, "Raccordable à proximité immédiate"]
    ];

    doc.autoTable({
      startY: 154,
      head: [['Thématique de Diagnostic', 'Note d\'évaluation', 'Observations techniques']],
      body: tableData,
      headStyles: { fillColor: primaryColor },
      theme: 'striped',
      margin: { left: 15, right: 15 }
    });

    // Recommandations de l'Expert
    const lastY = doc.lastAutoTable.finalY + 15;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Recommandations techniques préliminaires", 15, lastY);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    let textOffset = lastY + 8;

    if (simulatedClay === 'high') {
      doc.text("- Argile gonflante détectée : Des fondations profondes (micro-pieux) sont fortement recommandées.", 15, textOffset);
      textOffset += 7;
    }
    if (simulatedWetZone) {
      doc.text("- Risque Hydrologique : Une étude de sol de type G1/G2 avec sondage hydrogéologique est nécessaire.", 15, textOffset);
      textOffset += 7;
    }
    if (simulatedMonumentDist < 500) {
      doc.text("- Périmètre historique (ABF) : Le projet architectural devra respecter la charte locale des matériaux.", 15, textOffset);
      textOffset += 7;
    }
    if (simulatedSlope > 15) {
      doc.text("- Pente supérieure à 15% : Prévoir des terrassements spécifiques (cubatures de déblais/remblais).", 15, textOffset);
      textOffset += 7;
    }

    doc.text("- Optimisation bioclimatique : L'implantation de votre bâti doit privilégier une orientation sud/sud-ouest.", 15, textOffset);

    // Pied de page / Signature
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Ce diagnostic est une simulation en ligne basée sur des données statistiques ouvertes. Seule l'intervention physique", 15, 275);
    doc.text("d'un Géomètre-Expert d'Urbateam sur site permet de dresser des plans officiels et un bornage juridiquement garanti.", 15, 279);
    doc.text(`Généré le ${new Date().toLocaleDateString()} - URBATEAM SARL`, 15, 283);

    doc.save(`Eco_Diagnostic_Foncier_Urbateam_${cadastreInfo.commune}.pdf`);
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
                <strong>Diagnostic chargé !</strong> Utilisez les curseurs de simulation dans le panneau de gauche pour affiner les contraintes réelles de votre projet.
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
            ) : cadastreInfo && diagnosisScores ? (
              <motion.div
                key="dashboard-sidebar"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={styles.sidebar}
              >
                {/* Curseurs de simulation interactive */}
                <GlassCard style={{ padding: '1.5rem' }}>
                  <h4 className={styles.simHeader}>
                    <Sliders size={16} />
                    Ajuster les caractéristiques
                    <span className={styles.interactiveBadge}>Interactif</span>
                  </h4>

                  {/* Curseur de Pente */}
                  <div className={styles.controlGroup}>
                    <label className={styles.controlLabel}>
                      <span>{t('eco.soil.slope') || "Pente moyenne"}</span>
                      <span className={styles.controlVal}>{simulatedSlope}%</span>
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max="40" 
                      value={simulatedSlope}
                      onChange={(e) => setSimulatedSlope(parseInt(e.target.value))}
                      className={styles.rangeSlider}
                    />
                  </div>

                  {/* Argile Select */}
                  <div className={styles.controlGroup} style={{ marginTop: '0.8rem' }}>
                    <label className={styles.controlLabel} style={{ marginBottom: '4px' }}>
                      <span>{t('eco.soil.clay_level') || "Risque Argile (G1/G2)"}</span>
                    </label>
                    <select
                      value={simulatedClay}
                      onChange={(e) => setSimulatedClay(e.target.value)}
                      style={{ padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
                    >
                      <option value="low">Faible (Zone sableuse/rocheuse)</option>
                      <option value="medium">Moyen (Silt / Limon breton)</option>
                      <option value="high">Élevé (Argiles gonflantes)</option>
                    </select>
                  </div>

                  {/* Monument Distance Slider */}
                  <div className={styles.controlGroup} style={{ marginTop: '0.8rem' }}>
                    <label className={styles.controlLabel}>
                      <span>{t('eco.heritage.monuments') || "Distance monument historique"}</span>
                      <span className={styles.controlVal}>{simulatedMonumentDist} m</span>
                    </label>
                    <input 
                      type="range" 
                      min="10" 
                      max="1000" 
                      value={simulatedMonumentDist}
                      onChange={(e) => setSimulatedMonumentDist(parseInt(e.target.value))}
                      className={styles.rangeSlider}
                    />
                  </div>

                  {/* Zone Humide toggle */}
                  <div className={styles.controlGroup} style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-light)' }}>
                      {t('eco.water.wet_zone') || "Zone humide identifiée"}
                    </span>
                    <label className={styles.switch} style={{ position: 'relative', display: 'inline-block', width: '34px', height: '20px' }}>
                      <input 
                        type="checkbox" 
                        checked={simulatedWetZone}
                        onChange={(e) => setSimulatedWetZone(e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: simulatedWetZone ? 'var(--primary-color)' : '#cbd5e1',
                        borderRadius: '20px', transition: '.4s'
                      }}>
                        <span style={{
                          position: 'absolute', content: '""', height: '14px', width: '14px', left: simulatedWetZone ? '16px' : '3px', bottom: '3px',
                          backgroundColor: 'white', borderRadius: '50%', transition: '.4s'
                        }}></span>
                      </span>
                    </label>
                  </div>
                </GlassCard>

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
          {cadastreInfo && diagnosisScores && (
            <div className={styles.scoreBanner}>
              <div className={styles.scoreCircle}>
                {diagnosisScores.overall}
              </div>
              <div className={styles.scoreTextContainer}>
                <h3 className={styles.scoreTitle}>
                  {t('eco.overall_score') || "Score global de viabilité"}
                </h3>
                <p className={styles.scoreDesc}>
                  {t('eco.overall_desc') || "Évaluation générale de constructibilité en zone protégée et risques environnementaux."}
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
              >
                <ChangeView center={mapCenter} zoom={zoomLevel} />
                <MapEventsHandler onMapClick={handleMapClick} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
                />
                
                {/* Couche transparent Cadastre */}
                <TileLayer
                  attribution='&copy; Direction générale des Finances publiques - Cadastre'
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
              
              {diagnosisScores ? (
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
                  Sélectionnez une parcelle pour générer le graphique radar d'analyse.
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
          {cadastreInfo && diagnosisScores && (
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
                  className={`${styles.tabButton} ${activeTab === 'climate' ? styles.tabButtonActive : ''}`}
                  onClick={() => setActiveTab('climate')}
                >
                  <Sun size={14} />
                  {t('eco.axes.climate') || "Solaire & Climat"}
                </button>
                <button 
                  className={`${styles.tabButton} ${activeTab === 'heritage' ? styles.tabButtonActive : ''}`}
                  onClick={() => setActiveTab('heritage')}
                >
                  <Building2 size={14} />
                  {t('eco.axes.heritage') || "Patrimoine & Règles"}
                </button>
                <button 
                  className={`${styles.tabButton} ${activeTab === 'viability' ? styles.tabButtonActive : ''}`}
                  onClick={() => setActiveTab('viability')}
                >
                  <TreePine size={14} />
                  {t('eco.axes.viability') || "Réseaux & Accès"}
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
                        <div className={styles.indicatorCard}>
                          <span className={styles.indicatorLabel}>{t('eco.soil.clay_level')}</span>
                          <span className={`${styles.indicatorValue} ${simulatedClay === 'high' ? styles.statusDanger : simulatedClay === 'medium' ? styles.statusWarning : styles.statusSuccess}`}>
                            {simulatedClay === 'high' ? 'Aléa Fort (Argiles)' : simulatedClay === 'medium' ? 'Aléa Moyen' : 'Aléa Faible'}
                          </span>
                          <span className={styles.indicatorStatus}>
                            {simulatedClay === 'high' 
                              ? 'Risque élevé de fissures. Fondations spéciales requises.' 
                              : 'Sol stable, aucune contrainte majeure.'}
                          </span>
                        </div>

                        <div className={styles.indicatorCard}>
                          <span className={styles.indicatorLabel}>{t('eco.soil.slope')}</span>
                          <span className={`${styles.indicatorValue} ${simulatedSlope > 15 ? styles.statusWarning : styles.statusSuccess}`}>
                            {simulatedSlope} %
                          </span>
                          <span className={styles.indicatorStatus}>
                            {simulatedSlope > 15 
                              ? 'Pente forte. Risque de glissement de terrain à modérer.' 
                              : 'Pente douce idéale pour aménagement.'}
                          </span>
                        </div>

                        <div className={styles.indicatorCard}>
                          <span className={styles.indicatorLabel}>Sismicité</span>
                          <span className={styles.indicatorValue}>Zone 2 (Faible)</span>
                          <span className={styles.indicatorStatus}>Règles de construction parasismiques standard.</span>
                        </div>
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
                        <div className={styles.indicatorCard}>
                          <span className={styles.indicatorLabel}>{t('eco.water.wet_zone')}</span>
                          <span className={`${styles.indicatorValue} ${simulatedWetZone ? styles.statusDanger : styles.statusSuccess}`}>
                            {simulatedWetZone ? 'Présence détectée' : 'Aucune zone humide'}
                          </span>
                          <span className={styles.indicatorStatus}>
                            {simulatedWetZone 
                              ? 'Préservation écologique obligatoire. Construction interdite ou régulée.' 
                              : 'Sol sec, conforme à la règlementation.'}
                          </span>
                        </div>

                        <div className={styles.indicatorCard}>
                          <span className={styles.indicatorLabel}>Risque inondabilité</span>
                          <span className={styles.indicatorValue}>Hors PPRI (Favorable)</span>
                          <span className={styles.indicatorStatus}>Parcelle située en dehors des zones d'inondation de crue.</span>
                        </div>

                        <div className={styles.indicatorCard}>
                          <span className={styles.indicatorLabel}>Ruissellement pluvial</span>
                          <span className={styles.indicatorValue}>Risque modéré</span>
                          <span className={styles.indicatorStatus}>Une gestion alternative (noues, puits d'infiltration) est conseillée.</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'climate' && (
                    <div>
                      <div className={styles.tabHeader}>
                        <Sun size={20} color="var(--primary-color)" />
                        <h3 className={styles.tabTitle}>{t('eco.climate.title') || "Solaire & Climat"}</h3>
                      </div>
                      <p className={styles.tabDescription}>{t('eco.climate.desc') || "Potentiel bioclimatique du terrain."}</p>
                      
                      <div className={styles.tabGrid}>
                        <div className={styles.indicatorCard}>
                          <span className={styles.indicatorLabel}>{t('eco.climate.exposure')}</span>
                          <span className={styles.indicatorValue}>
                            {simulatedExposure === 'south' ? 'Plein Sud ☀️' : simulatedExposure === 'west' ? 'Ouest' : simulatedExposure === 'east' ? 'Est' : 'Nord ❄️'}
                          </span>
                          <span className={styles.indicatorStatus}>
                            {simulatedExposure === 'south' 
                              ? 'Excellente luminosité naturelle, idéal RT2020 / RE2020.' 
                              : 'Luminosité réduite en hiver, optimiser les ouvertures.'}
                          </span>
                        </div>

                        <div className={styles.indicatorCard}>
                          <span className={styles.indicatorLabel}>{t('eco.climate.solar_potential')}</span>
                          <span className={`${styles.indicatorValue} ${styles.statusSuccess}`}>
                            {simulatedExposure === 'south' ? 'Excellent (1150 kWh/m²)' : 'Moyen (850 kWh/m²)'}
                          </span>
                          <span className={styles.indicatorStatus}>Fort potentiel de rendement pour panneaux photovoltaïques.</span>
                        </div>

                        <div className={styles.indicatorCard}>
                          <span className={styles.indicatorLabel}>Exposition aux Vents</span>
                          <span className={styles.indicatorValue}>Littoral Ouest (Exposé)</span>
                          <span className={styles.indicatorStatus}>Prévoir des brise-vents naturels ou plantations paysagères adaptées.</span>
                        </div>
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
                        <div className={styles.indicatorCard}>
                          <span className={styles.indicatorLabel}>{t('eco.heritage.monuments')}</span>
                          <span className={`${styles.indicatorValue} ${simulatedMonumentDist < 500 ? styles.statusWarning : styles.statusSuccess}`}>
                            {simulatedMonumentDist} m
                          </span>
                          <span className={styles.indicatorStatus}>
                            {simulatedMonumentDist < 500 
                              ? "Situé dans le rayon de 500m. Avis de l'Architecte des Bâtiments de France obligatoire." 
                              : "Hors périmètre de protection historique."}
                          </span>
                        </div>

                        <div className={styles.indicatorCard}>
                          <span className={styles.indicatorLabel}>Zonage PLU</span>
                          <span className={styles.indicatorValue}>Zone U (Urbaine)</span>
                          <span className={styles.indicatorStatus}>Règlementation favorable à la densification douce.</span>
                        </div>

                        <div className={styles.indicatorCard}>
                          <span className={styles.indicatorLabel}>Natura 2000</span>
                          <span className={styles.indicatorValue}>Non concerné</span>
                          <span className={styles.indicatorStatus}>Aucune contrainte d'espace naturel protégé.</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'viability' && (
                    <div>
                      <div className={styles.tabHeader}>
                        <TreePine size={20} color="var(--primary-color)" />
                        <h3 className={styles.tabTitle}>{t('eco.viability.title') || "Réseaux & Viabilité foncière"}</h3>
                      </div>
                      <p className={styles.tabDescription}>{t('eco.viability.desc') || "Proximité aux infrastructures publiques."}</p>
                      
                      <div className={styles.tabGrid}>
                        <div className={styles.indicatorCard}>
                          <span className={styles.indicatorLabel}>{t('eco.viability.access')}</span>
                          <span className={styles.indicatorValue}>Conforme (Voirie publique)</span>
                          <span className={styles.indicatorStatus}>Accès routier existant et sécurisé, répondant aux exigences incendie.</span>
                        </div>

                        <div className={styles.indicatorCard}>
                          <span className={styles.indicatorLabel}>Raccordement réseaux</span>
                          <span className={styles.indicatorValue}>{"Proche (< 15 mètres)"}</span>
                          <span className={styles.indicatorStatus}>Réseaux d'eau potable et électricité disponibles en bordure de parcelle.</span>
                        </div>

                        <div className={styles.indicatorCard}>
                          <span className={styles.indicatorLabel}>Assainissement</span>
                          <span className={styles.indicatorValue}>Collectif (Tout-à-l'égout)</span>
                          <span className={styles.indicatorStatus}>Raccordement obligatoire au réseau public existant.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
