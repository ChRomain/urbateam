'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Ruler, 
  Scale, 
  RefreshCw, 
  AlertCircle, 
  MapPin, 
  Sliders, 
  Download, 
  Layers, 
  Info, 
  Activity,
  ArrowRight,
  Search,
  Loader
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import GlassCard from '../../components/GlassCard';
import { useLanguage } from '../../context/LanguageContext';
import 'leaflet/dist/leaflet.css';
import styles from './ProfilLongClient.module.css';

import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  CartesianGrid 
} from 'recharts';

// Fix pour les icônes par défaut de Leaflet
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Icônes personnalisées de couleurs pour distinguer Point A et Point B
const createCustomIcon = (color) => {
  if (typeof window === 'undefined') return null;
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Formule de Haversine pour calculer la distance exacte en mètres entre deux points GPS
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Rayon de la Terre en mètres
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Gère le centrage automatique de la carte
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

// Capte les clics sur la carte pour définir les points A et B
function MapEventsHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function ProfilLongClient() {
  const { t } = useLanguage();

  // États géographiques (Brest, Menez-Hom ou zones à fort relief en Bretagne par défaut)
  const [mapCenter, setMapCenter] = useState([48.2201, -4.2325]); // Proche du Menez-Hom pour tester de beaux reliefs !
  const [zoomLevel, setZoomLevel] = useState(13);

  // États de recherche d'adresse
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [apiError, setApiError] = useState(false);

  const autocompleteRef = useRef(null);

  // Fermer les suggestions au clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recherche d'adresses (API Adresse de l'État Français via proxy local)
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
    }, 300); // Debounce de 300ms

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSelectAddress = (feature) => {
    const coords = feature.geometry.coordinates; // [lon, lat]
    const lon = coords[0];
    const lat = coords[1];
    const label = feature.properties.label;
    
    setSearchQuery(label);
    setShowSuggestions(false);
    setMapCenter([lat, lon]);
    setZoomLevel(17); // Zoom de précision sur la zone
  };

  // Points A et B
  const [pointA, setPointA] = useState(null); // [lat, lon]
  const [pointB, setPointB] = useState(null); // [lat, lon]

  // Données d'élévation reçues de l'IGN
  const [elevationData, setElevationData] = useState([]);
  const [heightDifferences, setHeightDifferences] = useState({ positive: 0, negative: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Point de survol synchronisé entre le graphique et la carte
  const [hoveredPoint, setHoveredPoint] = useState(null); // [lat, lon]

  // Outil Premium : Terrassement (Ligne de Projet)
  const [enableProject, setEnableProject] = useState(false);
  const [projectAltitude, setProjectAltitude] = useState(0);

  // Refs pour le système de throttling
  const lastFetchTime = useRef(0);
  const fetchTimeout = useRef(null);
  const isDragging = useRef(false);

  // Initialisation ou réinitialisation complète de l'outil
  const handleReset = () => {
    setPointA(null);
    setPointB(null);
    setElevationData([]);
    setHeightDifferences({ positive: 0, negative: 0 });
    setHoveredPoint(null);
    setEnableProject(false);
    setError('');
  };

  // Clic sur la carte
  const handleMapClick = (latlng) => {
    const coords = [latlng.lat, latlng.lng];
    if (!pointA) {
      setPointA(coords);
    } else if (!pointB) {
      setPointB(coords);
      fetchProfile(pointA, coords, 100); // 100 points de précision par défaut au clic
    }
  };

  // Récupère le profil altimétrique via l'API locale
  const fetchProfile = async (coordsA, coordsB, sampling = 50) => {
    if (!coordsA || !coordsB) return;
    setLoading(true);
    setError('');

    try {
      const url = `/api/profil-altimetrique?lat1=${coordsA[0]}&lon1=${coordsA[1]}&lat2=${coordsB[0]}&lon2=${coordsB[1]}&sampling=${sampling}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error('Erreur lors du calcul altimétrique.');
      }

      const data = await res.json();

      if (data.elevations && data.elevations.length > 0) {
        // Formater les points avec calcul de la distance cumulée
        const elevations = data.elevations;
        const formatted = [];
        let cumulativeDistance = 0;

        for (let i = 0; i < elevations.length; i++) {
          const pt = elevations[i];
          if (i > 0) {
            const prevPt = elevations[i - 1];
            const dist = getDistance(prevPt.lat, prevPt.lon, pt.lat, pt.lon);
            cumulativeDistance += dist;
          }

          formatted.push({
            lat: pt.lat,
            lon: pt.lon,
            z: parseFloat(pt.z.toFixed(2)),
            distance: Math.round(cumulativeDistance),
            // Pente locale entre ce point et le suivant
            slope: 0
          });
        }

        // Calculer les pentes locales par segment
        for (let i = 0; i < formatted.length - 1; i++) {
          const run = formatted[i + 1].distance - formatted[i].distance;
          const rise = formatted[i + 1].z - formatted[i].z;
          if (run > 0) {
            formatted[i].slope = parseFloat(((rise / run) * 100).toFixed(1));
          }
        }
        // Le dernier point prend la pente du précédent pour le rendu
        if (formatted.length > 1) {
          formatted[formatted.length - 1].slope = formatted[formatted.length - 2].slope;
        }

        setElevationData(formatted);

        // Si l'altitude projet n'est pas encore initialisée, on la place à l'altitude moyenne
        const altitudes = formatted.map(p => p.z);
        const minZ = Math.min(...altitudes);
        const maxZ = Math.max(...altitudes);
        setProjectAltitude(Math.round((minZ + maxZ) / 2));

        setHeightDifferences({
          positive: parseFloat((data.height_differences?.positive || 0).toFixed(1)),
          negative: parseFloat((data.height_differences?.negative || 0).toFixed(1))
        });
      } else {
        setError('Aucune donnée d\'altitude renvoyée par le serveur.');
      }
    } catch (err) {
      console.error(err);
      setError('Impossible d\'obtenir le profil. Vérifiez votre connexion internet ou réessayez.');
    } finally {
      setLoading(false);
    }
  };

  // Moteur Throttled pour les mouvements à la souris (Point A ou B)
  const handleMarkerDrag = (e, markerType) => {
    const { lat, lng } = e.target.getLatLng();
    const newCoords = [lat, lng];

    isDragging.current = true;

    let nextA = pointA;
    let nextB = pointB;

    if (markerType === 'A') {
      setPointA(newCoords);
      nextA = newCoords;
    } else {
      setPointB(newCoords);
      nextB = newCoords;
    }

    const now = Date.now();
    const throttleDelay = 140; // ~7 requêtes par seconde max pour préserver le serveur

    if (now - lastFetchTime.current > throttleDelay) {
      fetchProfile(nextA, nextB, 50); // 50 points d'échantillonnage pendant le drag pour plus de fluidité
      lastFetchTime.current = now;
    } else {
      // Planifier une mise à jour finale pour ne pas manquer la dernière coordonnée
      if (fetchTimeout.current) clearTimeout(fetchTimeout.current);
      fetchTimeout.current = setTimeout(() => {
        fetchProfile(nextA, nextB, 50);
        lastFetchTime.current = Date.now();
      }, throttleDelay);
    }
  };

  // Drag terminé : on demande la haute précision (100 points) pour un rendu final net
  const handleMarkerDragEnd = (markerType) => {
    isDragging.current = false;
    if (fetchTimeout.current) clearTimeout(fetchTimeout.current);
    fetchProfile(pointA, pointB, 100);
  };

  // Statistiques calculées à la volée sur le profil
  const stats = useMemo(() => {
    if (elevationData.length === 0) return null;

    const altitudes = elevationData.map(p => p.z);
    const minZ = Math.min(...altitudes);
    const maxZ = Math.max(...altitudes);
    
    const ptMin = elevationData.find(p => p.z === minZ);
    const ptMax = elevationData.find(p => p.z === maxZ);

    const startZ = elevationData[0].z;
    const endZ = elevationData[elevationData.length - 1].z;
    const totalDistance = elevationData[elevationData.length - 1].distance;

    // Pente moyenne absolue globale
    const globalRise = endZ - startZ;
    const avgSlope = totalDistance > 0 
      ? parseFloat(((globalRise / totalDistance) * 100).toFixed(1)) 
      : 0;

    // Pente locale maximale (en valeur absolue)
    const slopes = elevationData.map(p => Math.abs(p.slope));
    const maxSlope = parseFloat(Math.max(...slopes).toFixed(1));

    // Simulation terrassement (Déblais / Remblais) en 2D (m² ou m³/m linéaire)
    let totalDeblaiArea = 0; // Surface au-dessus de la ligne projet
    let totalRemblaiArea = 0; // Surface en dessous de la ligne projet

    if (enableProject) {
      for (let i = 0; i < elevationData.length - 1; i++) {
        const p1 = elevationData[i];
        const p2 = elevationData[i + 1];
        const segmentLength = p2.distance - p1.distance;

        // Calcul des trapèzes par rapport à l'altitude projet
        const z1_diff = p1.z - projectAltitude;
        const z2_diff = p2.z - projectAltitude;

        if (z1_diff >= 0 && z2_diff >= 0) {
          // Tout en déblai
          totalDeblaiArea += ((z1_diff + z2_diff) / 2) * segmentLength;
        } else if (z1_diff <= 0 && z2_diff <= 0) {
          // Tout en remblai
          totalRemblaiArea += ((Math.abs(z1_diff) + Math.abs(z2_diff)) / 2) * segmentLength;
        } else {
          // Le segment croise la ligne de projet. 
          // Calculer le point d'intersection exacte pour séparer déblai et remblai
          const fraction = Math.abs(z1_diff) / (Math.abs(z1_diff) + Math.abs(z2_diff));
          const intersectionDist = segmentLength * fraction;

          if (z1_diff > 0) {
            // Première partie en déblai, deuxième en remblai
            totalDeblaiArea += (z1_diff / 2) * intersectionDist;
            totalRemblaiArea += (Math.abs(z2_diff) / 2) * (segmentLength - intersectionDist);
          } else {
            // Première partie en remblai, deuxième en déblai
            totalRemblaiArea += (Math.abs(z1_diff) / 2) * intersectionDist;
            totalDeblaiArea += (z2_diff / 2) * (segmentLength - intersectionDist);
          }
        }
      }
    }

    return {
      minZ,
      maxZ,
      ptMin,
      ptMax,
      totalDistance,
      avgSlope,
      maxSlope,
      deblai: Math.round(totalDeblaiArea), // en m³ pour 1m de largeur
      remblai: Math.round(totalRemblaiArea)
    };
  }, [elevationData, enableProject, projectAltitude]);

  // Export PDF basique ou capture d'écran de l'outil
  const handleExport = () => {
    if (typeof window === 'undefined') return;
    window.print();
  };

  // Ajustement automatique des bornes Y pour maximiser l'effet de relief
  const yDomain = useMemo(() => {
    if (elevationData.length === 0) return [0, 100];
    const altitudes = elevationData.map(p => p.z);
    if (enableProject) altitudes.push(projectAltitude);
    
    const min = Math.min(...altitudes);
    const max = Math.max(...altitudes);
    const pad = (max - min) * 0.15 || 10; // 15% de marge en haut/bas

    return [Math.max(0, Math.floor(min - pad)), Math.ceil(max + pad)];
  }, [elevationData, enableProject, projectAltitude]);

  return (
    <div className="container py-section">
      <PageHeader 
        title="Profil en Long Interactif" 
        subtitle="Calculez la coupe de relief d'un terrain en temps réel en reliant simplement deux points géographiques." 
      />

      {/* Barre de tutoriel interactive */}
      <div className={styles.introCard}>
        <GlassCard style={{ padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className={styles.introIcon}>
            <Info size={22} color="var(--primary-color)" />
          </div>
          <div className={styles.introContent}>
            {!pointA ? (
              <span className={styles.introText}>
                <strong>Étape 1 :</strong> Cliquez n'importe où sur la carte ci-dessous pour placer le <strong>Point de départ A</strong>.
              </span>
            ) : !pointB ? (
              <span className={styles.introText}>
                <strong>Étape 2 :</strong> Cliquez sur un autre endroit pour placer le <strong>Point d'arrivée B</strong> et générer la coupe.
              </span>
            ) : (
              <span className={styles.introText}>
                <strong>Coupe active :</strong> Faites glisser les repères <strong>A (Bleu)</strong> ou <strong>B (Violet)</strong> à la souris pour déplacer la coupe et observer la mise à jour instantanée !
              </span>
            )}
          </div>
          {pointA && (
            <button className="btn btn-outline" onClick={handleReset} style={{ marginLeft: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              <RefreshCw size={14} className={loading ? 'spin' : ''} style={{ marginRight: '6px' }} />
              Réinitialiser
            </button>
          )}
        </GlassCard>
      </div>

      <div className={styles.dashboardGrid}>
        {/* Colonne latérale (Sidebar) */}
        <div className={styles.sidebar}>
          {/* Recherche d'adresse */}
          <GlassCard style={{ padding: '1.5rem', overflow: 'visible', zIndex: 50 }}>
            <h4 className={styles.searchHeader} style={{ fontSize: '1rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary-color)' }}>
              <Search size={16} color="var(--primary-color)" />
              Rechercher une adresse
            </h4>
            
            <div ref={autocompleteRef} className={styles.searchInputWrapper}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder="Ex: 10 rue de Brest, Saint-Renan"
                className={styles.searchInput}
              />
              <span className={styles.searchIcon}>
                {loadingSuggestions ? <Loader size={16} className="spin" /> : <MapPin size={16} />}
              </span>

              {/* Suggestions dropdown */}
              <AnimatePresence>
                {showSuggestions && (suggestions.length > 0 || apiError) && (
                  <motion.ul 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={styles.suggestionsList}
                  >
                    {apiError ? (
                      <li style={{ padding: '0.6rem 0.8rem', color: '#ef4444', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertCircle size={12} />
                        Service indisponible
                      </li>
                    ) : (
                      suggestions.map((feature, idx) => (
                        <li 
                          key={idx}
                          onClick={() => handleSelectAddress(feature)}
                          className={styles.suggestionItem}
                        >
                          <MapPin size={12} color="var(--primary-color)" />
                          {feature.properties.label}
                        </li>
                      ))
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>

          {/* Section 1: Instructions ou Statistiques */}
          <AnimatePresence mode="wait">
            {!pointA || !pointB || elevationData.length === 0 ? (
              <motion.div
                key="onboarding"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <GlassCard className={styles.statCard}>
                  <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <div className={styles.pulsePin}>
                      <MapPin size={32} color="var(--primary-color)" />
                    </div>
                    <h4 style={{ margin: '1.5rem 0 0.5rem 0', fontWeight: '600' }}>Prêt à mesurer</h4>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                      Cette coupe dynamique de terrain utilise la base de données <strong>IGN RGE Alti</strong> de haute précision pour vous fournir une coupe verticale exacte.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1.5rem', textAlign: 'left' }}>
                      <div className={styles.bulletItem}>
                        <ArrowRight size={14} color="var(--primary-color)" />
                        <span>Précision au mètre près</span>
                      </div>
                      <div className={styles.bulletItem}>
                        <ArrowRight size={14} color="var(--primary-color)" />
                        <span>Dénivelés cumulés précis (D+/D-)</span>
                      </div>
                      <div className={styles.bulletItem}>
                        <ArrowRight size={14} color="var(--primary-color)" />
                        <span>Simulation de terrassements (Déblais/Remblais)</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div
                key="stats-loaded"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                {/* Statistiques géomorphologiques */}
                <GlassCard className={styles.statCard}>
                  <h4 className={styles.cardHeader}>
                    <Activity size={18} color="var(--primary-color)" />
                    Indicateurs du Terrain
                  </h4>
                  
                  {stats && (
                    <div className={styles.statsGrid}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Distance Totale</span>
                        <div className={styles.statValueWrapper}>
                          <Ruler size={16} color="var(--text-light)" />
                          <strong className={styles.statValue}>
                            {stats.totalDistance >= 1000 
                              ? `${(stats.totalDistance / 1000).toFixed(2)} km` 
                              : `${stats.totalDistance} m`}
                          </strong>
                        </div>
                      </div>

                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Dénivelé Positif (D+)</span>
                        <div className={styles.statValueWrapper}>
                          <TrendingUp size={16} color="#10b981" />
                          <strong className={styles.statValue} style={{ color: '#10b981' }}>
                            +{heightDifferences.positive} m
                          </strong>
                        </div>
                      </div>

                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Dénivelé Négatif (D-)</span>
                        <div className={styles.statValueWrapper}>
                          <TrendingDown size={16} color="#ef4444" />
                          <strong className={styles.statValue} style={{ color: '#ef4444' }}>
                            -{heightDifferences.negative} m
                          </strong>
                        </div>
                      </div>

                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Pente Moyenne</span>
                        <strong className={styles.statValue}>
                          {stats.avgSlope}%
                        </strong>
                      </div>

                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Pente Locale Max</span>
                        <strong className={styles.statValue} style={{ color: 'var(--accent-color)' }}>
                          {stats.maxSlope}%
                        </strong>
                      </div>

                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Altitude (Min / Max)</span>
                        <strong className={styles.statValue} style={{ fontSize: '0.9rem' }}>
                          {stats.minZ}m / {stats.maxZ}m
                        </strong>
                      </div>
                    </div>
                  )}
                </GlassCard>

                {/* Module de Terrassement / Cubatures */}
                <GlassCard className={styles.statCard}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h4 className={styles.cardHeader} style={{ margin: 0 }}>
                      <Scale size={18} color="var(--accent-color)" />
                      Simuler un Terrassement
                    </h4>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={enableProject} 
                        onChange={(e) => setEnableProject(e.target.checked)} 
                      />
                      <span className={styles.sliderRound}></span>
                    </label>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', lineHeight: '1.4', marginBottom: '1.2rem' }}>
                    Activez la ligne de projet pour estimer les volumes de déblais (terre à extraire) et de remblais (terre à ajouter) le long de la coupe.
                  </p>

                  <AnimatePresence>
                    {enableProject && stats && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className={styles.projectControl}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '500', marginBottom: '5px' }}>
                            <span>Niveau du projet</span>
                            <span style={{ color: 'var(--accent-color)' }}>{projectAltitude} m (NGF)</span>
                          </div>
                          <input 
                            type="range" 
                            min={stats.minZ} 
                            max={stats.maxZ} 
                            value={projectAltitude} 
                            onChange={(e) => setProjectAltitude(parseInt(e.target.value, 10))}
                            className={styles.rangeSlider}
                          />
                        </div>

                        <div className={styles.volumeBox}>
                          <div className={styles.volumeItem} style={{ borderLeft: '3px solid #ef4444' }}>
                            <span className={styles.volumeLabel}>Déblais estimatifs (Excavation)</span>
                            <strong className={styles.volumeValue} style={{ color: '#ef4444' }}>{stats.deblai} m³</strong>
                            <span className={styles.volumeSub}>pour 1m de largeur</span>
                          </div>

                          <div className={styles.volumeItem} style={{ borderLeft: '3px solid #3b82f6' }}>
                            <span className={styles.volumeLabel}>Remblais estimatifs (Apport)</span>
                            <strong className={styles.volumeValue} style={{ color: '#3b82f6' }}>{stats.remblai} m³</strong>
                            <span className={styles.volumeSub}>pour 1m de largeur</span>
                          </div>
                        </div>

                        <div className={styles.earthworkBalance}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Bilan (Déblai - Remblai) :</span>
                          <strong style={{ 
                            fontSize: '0.85rem',
                            color: stats.deblai - stats.remblai >= 0 ? '#ef4444' : '#3b82f6' 
                          }}>
                            {stats.deblai - stats.remblai >= 0 ? '+' : ''}{stats.deblai - stats.remblai} m³
                          </strong>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>

                {/* Bouton d'export */}
                <button className="btn btn-outline" onClick={handleExport} style={{ width: '100%' }}>
                  <Download size={16} style={{ marginRight: '8px' }} />
                  Exporter la Fiche Profil
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bloc principal de la carte */}
        <div className={styles.mapWrapper}>
          <MapContainer 
            center={mapCenter} 
            zoom={zoomLevel} 
            style={{ height: '100%', width: '100%', borderRadius: '15px' }}
            scrollWheelZoom={true}
          >
            <ChangeView 
              center={
                pointA && pointB && !isDragging.current
                  ? [
                      (pointA[0] + pointB[0]) / 2, 
                      (pointA[1] + pointB[1]) / 2
                    ] 
                  : mapCenter
              } 
              zoom={pointA && pointB && !isDragging.current ? 14 : zoomLevel} 
            />
            
            <MapEventsHandler onMapClick={handleMapClick} />
            
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
            />
            
            {/* Couche Cadastre transparente de l'IGN pour une dimension pro BTP */}
            <TileLayer
              attribution='&copy; Direction générale des Finances publiques - Cadastre'
              url="https://tms.cadastral.openstreetmap.fr/tms/1.0.0/parcel/{z}/{x}/{y}.png"
              tms={true}
              opacity={0.3}
            />

            {/* Marqueur Point A */}
            {pointA && (
              <Marker 
                position={pointA}
                draggable={!!pointB} // Le marker n'est déplaçable qu'une fois la ligne tracée
                eventHandlers={{
                  drag: (e) => handleMarkerDrag(e, 'A'),
                  dragend: () => handleMarkerDragEnd('A')
                }}
                icon={createCustomIcon('blue')}
              />
            )}

            {/* Marqueur Point B */}
            {pointB && (
              <Marker 
                position={pointB}
                draggable={true}
                eventHandlers={{
                  drag: (e) => handleMarkerDrag(e, 'B'),
                  dragend: () => handleMarkerDragEnd('B')
                }}
                icon={createCustomIcon('violet')}
              />
            )}

            {/* Ligne connectrice 2D dessinée sur la carte */}
            {pointA && pointB && (
              <Polyline 
                positions={[pointA, pointB]}
                pathOptions={{
                  color: 'var(--primary-color, #8b5cf6)',
                  weight: 4,
                  opacity: 0.8,
                  dashArray: '2, 6'
                }}
              />
            )}

            {/* Marqueur de survol synchronisé avec le graphique */}
            {hoveredPoint && (
              <Marker 
                position={hoveredPoint}
                icon={new L.Icon({
                  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                  iconSize: [20, 33],
                  iconAnchor: [10, 33],
                  shadowSize: [33, 33]
                })}
              />
            )}
          </MapContainer>

          {/* Micro loader discret pendant le chargement des altitudes */}
          {loading && (
            <div className={styles.mapLoader}>
              <div className="spin-loader" style={{
                width: '18px',
                height: '18px',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderTop: '2px solid #fff',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}></div>
              <span>Calcul altimétrique IGN...</span>
            </div>
          )}

          {error && (
            <div className={styles.mapError}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Zone Graphique (Profil en Long) */}
      <AnimatePresence>
        {pointA && pointB && elevationData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className={styles.chartWrapper}
          >
            <GlassCard style={{ padding: '1.5rem 1.5rem 0.5rem 1.5rem' }}>
              <div className={styles.chartHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} color="var(--primary-color)" />
                  <h4 style={{ margin: 0, fontWeight: '600' }}>Coupe altimétrique exacte (Profil en Long)</h4>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                  Axe horizontal : Distance (m) | Axe vertical : Altitude (m NGF)
                </span>
              </div>

              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={elevationData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    onMouseMove={(state) => {
                      if (state && state.activePayload && state.activePayload.length > 0) {
                        const pt = state.activePayload[0].payload;
                        setHoveredPoint([pt.lat, pt.lon]);
                      }
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <defs>
                      <linearGradient id="colorElevation" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary-color, #8b5cf6)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--primary-color, #8b5cf6)" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="distance" 
                      tick={{ fill: 'var(--text-light, #64748b)', fontSize: 10 }}
                      stroke="rgba(255,255,255,0.1)"
                      unit="m"
                    />
                    <YAxis 
                      domain={yDomain}
                      tick={{ fill: 'var(--text-light, #64748b)', fontSize: 10 }}
                      stroke="rgba(255,255,255,0.1)"
                      unit="m"
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length > 0) {
                          const data = payload[0].payload;
                          const projectDiff = enableProject ? (data.z - projectAltitude).toFixed(2) : null;
                          return (
                            <div className={styles.customTooltip}>
                              <div className={styles.tooltipRow}>
                                <span className={styles.tooltipLabel}>Distance:</span>
                                <strong className={styles.tooltipValue}>{data.distance} m</strong>
                              </div>
                              <div className={styles.tooltipRow}>
                                <span className={styles.tooltipLabel}>Altitude:</span>
                                <strong className={styles.tooltipValue} style={{ color: 'var(--primary-color)' }}>{data.z} m</strong>
                              </div>
                              <div className={styles.tooltipRow}>
                                <span className={styles.tooltipLabel}>Pente locale:</span>
                                <strong className={styles.tooltipValue} style={{ 
                                  color: data.slope >= 0 ? '#10b981' : '#ef4444' 
                                }}>
                                  {data.slope >= 0 ? '+' : ''}{data.slope}%
                                </strong>
                              </div>
                              {enableProject && (
                                <div className={styles.tooltipRow} style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '5px', paddingTop: '5px' }}>
                                  <span className={styles.tooltipLabel}>Diff/Projet:</span>
                                  <strong className={styles.tooltipValue} style={{ 
                                    color: projectDiff >= 0 ? '#ef4444' : '#3b82f6' 
                                  }}>
                                    {projectDiff >= 0 ? 'Déblai (+' : 'Remblai ('}{projectDiff} m)
                                  </strong>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="z" 
                      stroke="var(--primary-color, #8b5cf6)" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorElevation)" 
                    />

                    {/* Ligne de référence du Projet Altimétrique (Terrassement) */}
                    {enableProject && (
                      <ReferenceLine 
                        y={projectAltitude} 
                        stroke="var(--accent-color, #ef4444)" 
                        strokeWidth={2}
                        strokeDasharray="4 4" 
                        label={{ 
                          value: 'LIGNE PROJET', 
                          fill: 'var(--accent-color, #ef4444)', 
                          fontSize: 9,
                          fontWeight: '600',
                          position: 'top' 
                        }} 
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
