'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, CheckCircle, AlertTriangle, FileText, ArrowRight, 
  Loader, Ruler, RotateCw, Move, Trash2, Undo, Check, Layers
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import GlassCard from '../../components/GlassCard';
import { useLanguage } from '../../context/LanguageContext';
import 'leaflet/dist/leaflet.css';
import styles from './SimulateurDivisionClient.module.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap, useMapEvents, Polyline, Polygon } from 'react-leaflet';
import { supabase } from '../../lib/supabase';

// Fix pour les icônes par défaut de Leaflet
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Sécurisation du centrage de la carte
function ChangeView({ center, zoom, bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 20 });
    } else if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, bounds, map]);
  return null;
}

// Détecteur de clics sur la carte
function MapEventsHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    }
  });
  return null;
}

// Helper pour calculer la distance en mètres entre 2 coordonnées [lat, lon]
function calculateDistanceInMeters(p1, p2) {
  if (!p1 || !p2) return 0;
  const lat1 = p1[0], lon1 = p1[1];
  const lat2 = p2[0], lon2 = p2[1];
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return Math.round(R * c * 10) / 10;
}

// Helper pour calculer la surface exacte d'un polygone [lat, lon] en m² (Projection locale Shoelace)
function calculatePolygonAreaInM2(points) {
  if (!points || points.length < 3) return 0;
  const origin = points[0];
  const originLat = origin[0];
  const originLon = origin[1];

  const mPerLat = 111139;
  const mPerLon = 111139 * Math.cos((originLat * Math.PI) / 180);

  const pointsInMeters = points.map(p => ({
    x: (p[1] - originLon) * mPerLon,
    y: (p[0] - originLat) * mPerLat
  }));

  let area = 0;
  const n = pointsInMeters.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += pointsInMeters[i].x * pointsInMeters[j].y;
    area -= pointsInMeters[j].x * pointsInMeters[i].y;
  }

  return Math.round(Math.abs(area) / 2);
}

// Helper pour calculer le barycentre (centroid) d'un polygone GeoJSON
function getPolygonCentroid(geometry) {
  if (!geometry) return [48.3903, -4.4861]; // Brest par défaut
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

// Helper to check if a point [lat, lon] is inside a set of rings (Polygon coordinates)
function isPointInPolygon(point, rings) {
  const x = point[1]; // longitude
  const y = point[0]; // latitude
  let inside = false;
  
  const outerRing = rings[0];
  if (!outerRing) return false;
  
  for (let i = 0, j = outerRing.length - 1; i < outerRing.length; j = i++) {
    const xi = outerRing[i][0], yi = outerRing[i][1];
    const xj = outerRing[j][0], yj = outerRing[j][1];
    
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  if (!inside) return false;
  
  for (let k = 1; k < rings.length; k++) {
    const holeRing = rings[k];
    let insideHole = false;
    for (let i = 0, j = holeRing.length - 1; i < holeRing.length; j = i++) {
      const xi = holeRing[i][0], yi = holeRing[i][1];
      const xj = holeRing[j][0], yj = holeRing[j][1];
      
      const intersect = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) insideHole = !insideHole;
    }
    if (insideHole) return false;
  }
  
  return true;
}

// Helper to check if a point [lat, lon] is inside a Geometry (Polygon or MultiPolygon)
function isPointInGeometry(point, geometry) {
  if (!geometry) return false;
  
  if (geometry.type === 'Polygon') {
    return isPointInPolygon(point, geometry.coordinates);
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygonCoords of geometry.coordinates) {
      if (isPointInPolygon(point, polygonCoords)) {
        return true;
      }
    }
  }
  return false;
}

// Helper to extract bounds [minLat, maxLat, minLon, maxLon] from GeoJSON Geometry
function getGeometryBounds(geometry) {
  let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
  
  const processCoord = (coord) => {
    const lon = coord[0];
    const lat = coord[1];
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
  };
  
  const traverse = (coords) => {
    if (typeof coords[0] === 'number') {
      processCoord(coords);
    } else {
      coords.forEach(traverse);
    }
  };
  
  if (geometry && geometry.coordinates) {
    traverse(geometry.coordinates);
  }
  
  return { minLat, maxLat, minLon, maxLon };
}

// Helper to compute dynamic Lot A / Lot B split areas using a 40x40 grid
function computeSplitAreas(geometry, totalArea, splitAngle, splitOffset, centroid) {
  if (!geometry || !centroid) return { areaA: 0, areaB: 0 };
  
  const { minLat, maxLat, minLon, maxLon } = getGeometryBounds(geometry);
  
  const gridSize = 40;
  let countA = 0;
  let countB = 0;
  
  const lat = centroid[0];
  const lon = centroid[1];
  
  const angleRad = (splitAngle * Math.PI) / 180;
  const perpAngleRad = angleRad + Math.PI / 2;
  
  const latShift = splitOffset * 0.000005 * Math.sin(perpAngleRad);
  const lonShift = splitOffset * 0.000008 * Math.cos(perpAngleRad);
  
  const linePoint = [lat + latShift, lon + lonShift];
  const lineDir = [Math.sin(angleRad), Math.cos(angleRad)];
  const lineNormal = [-lineDir[1], lineDir[0]];
  
  const dLat = (maxLat - minLat) / (gridSize - 1);
  const dLon = (maxLon - minLon) / (gridSize - 1);
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const pt = [minLat + i * dLat, minLon + j * dLon];
      
      if (isPointInGeometry(pt, geometry)) {
        const dot = (pt[0] - linePoint[0]) * lineNormal[0] + (pt[1] - linePoint[1]) * lineNormal[1];
        if (dot >= 0) {
          countA++;
        } else {
          countB++;
        }
      }
    }
  }
  
  const totalPoints = countA + countB;
  if (totalPoints === 0) return { areaA: Math.round(totalArea / 2), areaB: Math.round(totalArea / 2) };
  
  const areaA = Math.round(totalArea * (countA / totalPoints));
  const areaB = Math.round(totalArea * (countB / totalPoints));
  
  return { areaA, areaB };
}


export default function SimulateurDivisionClient({ hideHeader = false, hideFooter = false, onAttachToContact = null }) {
  const { t } = useLanguage();
  const [attachedSuccess, setAttachedSuccess] = useState(false);
  
  // États de recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [apiError, setApiError] = useState(false);
  
  // Mode de tracé : 'auto' | 'two_points' | 'polygon'
  const [drawMode, setDrawMode] = useState('auto');
  const [twoPoints, setTwoPoints] = useState([]); // Array of 2 points [[lat1, lon1], [lat2, lon2]]
  const [polygonPoints, setPolygonPoints] = useState([]); // Array of points [[lat, lon], ...]

  // États cartographiques & Cadastre
  const [mapCenter, setMapCenter] = useState([48.3903, -4.4861]);
  const [zoomLevel, setZoomLevel] = useState(9);
  const [mapMode, setMapMode] = useState('geoportail'); // 'geoportail' | 'plan' | 'satellite'
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [cadastreGeoJson, setCadastreGeoJson] = useState(null);
  const [cadastreInfo, setCadastreInfo] = useState(null);
  const [loadingCadastre, setLoadingCadastre] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [centroid, setCentroid] = useState(null);

  // Curseurs de simulation de division
  const [splitAngle, setSplitAngle] = useState(90); // Angle en degrés (90° = vertical)
  const [splitOffset, setSplitOffset] = useState(0); // Déplacement latéral (-50 à +50)
  const [hasAccess, setHasAccess] = useState(true);

  // Formulaire de contact / capture de leads
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientMessage, setClientMessage] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState('');

  const autocompleteRef = useRef(null);

  // Fermeture du dropdown de suggestions lors d'un clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recherche d'adresses en direct (API Adresse Etalab)
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoadingSuggestions(true);
      setApiError(false);
      try {
        const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(searchQuery)}&limit=5`);
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

  // Clic sur une suggestion d'adresse
  const handleSelectAddress = async (feature) => {
    const coords = feature.geometry.coordinates; // [lon, lat]
    const lon = coords[0];
    const lat = coords[1];
    const label = feature.properties.label;
    
    setSelectedAddress(label);
    setSearchQuery(label);
    setShowSuggestions(false);
    setMapCenter([lat, lon]);
    setZoomLevel(21);
    setCadastreGeoJson(null);
    setCadastreInfo(null);
    setCentroid(null);
    setSplitOffset(0);
    setSplitAngle(90);
    setTwoPoints([]);
    setPolygonPoints([]);
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
            commune: props.nom_com || feature.properties.city || 'Inconnue',
            surface: props.contenance || 500,
          });

          const center = getPolygonCentroid(parcelFeature.geometry);
          setCentroid(center);
          setMapCenter(center);
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

  // Clic direct sur la carte selon le mode de dessin actif
  const handleMapClick = async (latlng) => {
    const point = [latlng.lat, latlng.lng];

    // Mode 2 Points : Placement de 2 points de coupe
    if (drawMode === 'two_points') {
      if (twoPoints.length >= 2) {
        setTwoPoints([point]);
      } else {
        setTwoPoints(prev => [...prev, point]);
      }
      return;
    }

    // Mode Polygone Libre : Ajout de sommets
    if (drawMode === 'polygon') {
      setPolygonPoints(prev => [...prev, point]);
      return;
    }

    // Mode Automatique / Sélection de parcelle
    const lat = latlng.lat;
    const lon = latlng.lng;
    
    setSelectedAddress(`Point sélectionné : ${lat.toFixed(5)}, ${lon.toFixed(5)}`);
    setMapCenter([lat, lon]);
    setZoomLevel(21);
    setCadastreGeoJson(null);
    setCadastreInfo(null);
    setCentroid(null);
    setSplitOffset(0);
    setSplitAngle(90);
    setTwoPoints([]);
    setPolygonPoints([]);
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

  // Soumission du formulaire de demande d'étude
  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setSubmittingLead(true);
    setLeadError('');

    let drawingSpecs = '';
    if (drawMode === 'two_points' && twoPoints.length === 2) {
      const dist = calculateDistanceInMeters(twoPoints[0], twoPoints[1]);
      drawingSpecs = ` [Tracé 2 Points: ${dist} m]`;
    } else if (drawMode === 'polygon' && polygonPoints.length >= 3) {
      const area = calculatePolygonAreaInM2(polygonPoints);
      drawingSpecs = ` [Polygone dessiné: ${area} m² (${polygonPoints.length} points)]`;
    }

    try {
      const payload = {
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        message: clientMessage + drawingSpecs,
        address: selectedAddress || searchQuery,
        parcel_info: cadastreInfo ? `Section ${cadastreInfo.section} n°${cadastreInfo.numero} (${cadastreInfo.surface} m²)` : null,
        simulation_data: {
          drawMode,
          twoPoints,
          polygonPoints,
          splitAngle,
          splitOffset,
          hasAccess,
          surfaceTotale,
          surfaceLotA,
          surfaceLotB
        }
      };

      const res = await fetch('/api/admin/projets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => null);

      setLeadSuccess(true);
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setClientMessage('');
    } catch (err) {
      console.error('Erreur soumission simulation :', err);
      setLeadError("Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.");
    } finally {
      setSubmittingLead(false);
    }
  };

  // Formateur du résumé du dessin sous forme de JSON structuré non-modifiable
  const buildSimulationSummary = () => {
    const payload = {
      type: 'URBATEAM_DRAWING_SIMULATION',
      version: '1.0',
      timestamp: new Date().toISOString(),
      selectedAddress,
      mapCenter,
      zoomLevel,
      cadastreInfo,
      drawMode,
      twoPoints,
      polygonPoints,
      splitAngle,
      splitOffset,
      hasAccess,
      surfaceTotale,
      surfaceLotA,
      surfaceLotB,
      twoPointsDistance,
      polygonArea
    };
    return JSON.stringify(payload);
  };

  const handleAttachClick = () => {
    const summary = buildSimulationSummary();
    if (onAttachToContact) {
      onAttachToContact(summary);
      setAttachedSuccess(true);
      setTimeout(() => setAttachedSuccess(false), 6000);
    } else {
      const encodedMsg = encodeURIComponent(summary);
      window.location.href = `/contact?msg=${encodedMsg}#contact-form-section`;
    }
  };

  // Moteur géométrique de découpe visuelle en direct
  const getDivisionLinePoints = () => {
    if (!centroid) return null;
    const lat = centroid[0];
    const lon = centroid[1];
    
    const angleRad = (splitAngle * Math.PI) / 180;
    const perpAngleRad = angleRad + Math.PI / 2;
    
    const latShift = splitOffset * 0.000005 * Math.sin(perpAngleRad);
    const lonShift = splitOffset * 0.000008 * Math.cos(perpAngleRad);
    
    const lineLat = lat + latShift;
    const lineLon = lon + lonShift;
    
    const p1 = [
      lineLat + 0.0025 * Math.sin(angleRad),
      lineLon + 0.0035 * Math.cos(angleRad)
    ];
    const p2 = [
      lineLat - 0.0025 * Math.sin(angleRad),
      lineLon - 0.0035 * Math.cos(angleRad)
    ];
    
    return [p1, p2];
  };

  const divisionLinePoints = getDivisionLinePoints();

  // Surface totale & découpe
  const surfaceTotale = cadastreInfo ? parseFloat(cadastreInfo.surface) : 0;
  
  const { areaA: surfaceLotA, areaB: surfaceLotB } = useMemo(() => {
    if (!cadastreGeoJson || surfaceTotale <= 0) return { areaA: 0, areaB: 0 };
    return computeSplitAreas(cadastreGeoJson, surfaceTotale, splitAngle, splitOffset, centroid);
  }, [cadastreGeoJson, surfaceTotale, splitAngle, splitOffset, centroid]);

  const splitRatioValA = surfaceTotale > 0 ? Math.round((surfaceLotA / surfaceTotale) * 100) : 50;
  const splitRatioValB = 100 - splitRatioValA;

  const twoPointsDistance = useMemo(() => {
    if (twoPoints.length < 2) return 0;
    return calculateDistanceInMeters(twoPoints[0], twoPoints[1]);
  }, [twoPoints]);

  const polygonArea = useMemo(() => {
    if (polygonPoints.length < 3) return 0;
    return calculatePolygonAreaInM2(polygonPoints);
  }, [polygonPoints]);

  const parcelBounds = useMemo(() => {
    if (!cadastreGeoJson) return null;
    const { minLat, maxLat, minLon, maxLon } = getGeometryBounds(cadastreGeoJson);
    if (minLat === Infinity || maxLat === -Infinity) return null;
    return [
      [minLat, minLon],
      [maxLat, maxLon]
    ];
  }, [cadastreGeoJson]);

  const isLotASurfaceValid = surfaceLotA >= 150;
  const isLotBSurfaceValid = surfaceLotB >= 150;
  const isFormValid = isLotASurfaceValid && isLotBSurfaceValid && hasAccess;

  return (
    <div className={hideHeader ? "" : "container py-section"}>
      {!hideHeader && (
        <PageHeader 
          title={t("division.title")} 
          subtitle={t("division.subtitle")} 
        />
      )}

      <div className={`${styles.layout} ${hideHeader ? styles.embeddedLayout : ''}`}>
        
        {/* Panel de contrôle et simulations (1/3) */}
        <div className={styles.sidebar}>
          
          {/* Recherche d'adresse */}
          <GlassCard style={{ padding: '2rem' }}>
            <h3 className={styles.searchHeader}>
              <Search size={20} color="var(--accent-color)" />
              {t("division.search_address")}
            </h3>
            
            <div ref={autocompleteRef} className={styles.searchInputWrapper}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder={t("cadastre.placeholder")}
                className={styles.searchInput}
              />
              <span className={styles.searchIcon}>
                {loadingSuggestions ? <Loader size={18} className="spin" /> : <MapPin size={18} />}
              </span>

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
                        {t("cadastre.error_addr_service")}
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
            
            <p className={styles.searchInfo}>
              {t("division.search_info")}
            </p>
          </GlassCard>

          {/* BARRE DE SÉLECTION DU MODE DE DESSIN */}
          <GlassCard style={{ padding: '1.25rem', marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '700', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🛠️ Mode de dessin du projet
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => setDrawMode('auto')}
                style={{
                  padding: '0.6rem 0.4rem',
                  borderRadius: '8px',
                  border: drawMode === 'auto' ? '2px solid var(--primary-color)' : '1px solid #e2e8f0',
                  backgroundColor: drawMode === 'auto' ? 'var(--primary-color)' : 'white',
                  color: drawMode === 'auto' ? 'white' : 'var(--text-main)',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                📐 Glissières
              </button>
              <button
                type="button"
                onClick={() => setDrawMode('two_points')}
                style={{
                  padding: '0.6rem 0.4rem',
                  borderRadius: '8px',
                  border: drawMode === 'two_points' ? '2px solid var(--primary-color)' : '1px solid #e2e8f0',
                  backgroundColor: drawMode === 'two_points' ? 'var(--primary-color)' : 'white',
                  color: drawMode === 'two_points' ? 'white' : 'var(--text-main)',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                📍 2 Points
              </button>
              <button
                type="button"
                onClick={() => setDrawMode('polygon')}
                style={{
                  padding: '0.6rem 0.4rem',
                  borderRadius: '8px',
                  border: drawMode === 'polygon' ? '2px solid var(--primary-color)' : '1px solid #e2e8f0',
                  backgroundColor: drawMode === 'polygon' ? 'var(--primary-color)' : 'white',
                  color: drawMode === 'polygon' ? 'white' : 'var(--text-main)',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                ✏️ Polygone
              </button>
            </div>

            {/* Consignes du mode actif */}
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-light)', backgroundColor: 'rgba(241, 245, 249, 0.8)', padding: '0.75rem', borderRadius: '8px' }}>
              {drawMode === 'auto' && (
                <p style={{ margin: 0 }}>Réglez la ligne de séparation à l'aide des curseurs d'angle et de position.</p>
              )}
              {drawMode === 'two_points' && (
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: 'var(--primary-color)' }}>
                    Cliquez 2 points sur la carte pour tracer une ligne de séparation sur-mesure.
                  </p>
                  {twoPoints.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Points placés : {twoPoints.length}/2 {twoPointsDistance > 0 && `(${twoPointsDistance} m)`}</span>
                      <button 
                        onClick={() => setTwoPoints([])}
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                      >
                        Réinitialiser
                      </button>
                    </div>
                  )}
                </div>
              )}
              {drawMode === 'polygon' && (
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: 'var(--primary-color)' }}>
                    Cliquez plusieurs points sur la carte pour dessiner la forme d'un bâtiment ou d'un lot.
                  </p>
                  {polygonPoints.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ fontWeight: '700', color: '#10b981' }}>
                        {polygonPoints.length} points placés • Surface : {polygonArea} m²
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => setPolygonPoints(prev => prev.slice(0, -1))}
                          style={{ flex: 1, padding: '0.3rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                        >
                          Annuler dernier
                        </button>
                        <button 
                          onClick={() => setPolygonPoints([])}
                          style={{ flex: 1, padding: '0.3rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                        >
                          Effacer tout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </GlassCard>

          {/* Panel d'informations et calculs de coupe */}
          <AnimatePresence mode="wait">
            {loadingCadastre ? (
              <motion.div
                key="loading-cadastre"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <GlassCard className={styles.loadingCard}>
                  <Loader size={40} className="spin" color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
                  <span className={styles.loadingText}>{t("division.loading_text")}</span>
                </GlassCard>
              </motion.div>
            ) : errorMsg ? (
              <motion.div
                key="error-cadastre"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <GlassCard className={styles.errorCard}>
                  <div className={styles.errorTitle}>
                    <AlertTriangle size={20} />
                    {t("cadastre.error_title")}
                  </div>
                  <p className={styles.errorText}>{t(errorMsg)}</p>
                </GlassCard>
              </motion.div>
            ) : cadastreInfo ? (
              <motion.div
                key="details-division"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={styles.sidebar}
              >
                {/* Outils de division (Ligne auto) */}
                {drawMode === 'auto' && (
                  <GlassCard className={styles.ficheCard}>
                    <h4 className={styles.simTitle}>
                      <Ruler size={18} color="var(--accent-color)" />
                      {t("division.divider_tool")}
                    </h4>

                    <div className={styles.controlGroup}>
                      <label className={styles.controlLabel}>
                        <span>{t("division.calculated_share")}</span>
                        <span className={styles.controlVal}>{splitRatioValA}% A / {splitRatioValB}% B</span>
                      </label>
                      <div className={styles.progressBarWrapper}>
                        <div 
                          className={styles.progressBarFillA} 
                          style={{ width: `${splitRatioValA}%` }} 
                        />
                        <div 
                          className={styles.progressBarFillB} 
                          style={{ width: `${splitRatioValB}%` }} 
                        />
                      </div>
                    </div>

                    <div className={styles.controlGroup}>
                      <label className={styles.controlLabel}>
                        <span>{t("division.split_angle")}</span>
                        <span className={styles.controlVal}>{splitAngle}°</span>
                      </label>
                      <input 
                        type="range" 
                        min="0" 
                        max="180" 
                        value={splitAngle} 
                        onChange={(e) => setSplitAngle(parseInt(e.target.value))}
                        className={styles.rangeInput}
                      />
                    </div>

                    <div className={styles.controlGroup}>
                      <label className={styles.controlLabel}>
                        <span>{t("division.split_offset")}</span>
                        <span className={styles.controlVal}>{splitOffset > 0 ? `+${splitOffset}` : splitOffset}</span>
                      </label>
                      <input 
                        type="range" 
                        min="-50" 
                        max="50" 
                        value={splitOffset} 
                        onChange={(e) => setSplitOffset(parseInt(e.target.value))}
                        className={styles.rangeInput}
                      />
                    </div>
                  </GlassCard>
                )}

                {/* Synthèse des Lots */}
                <GlassCard className={styles.ficheCard}>
                  <h4 className={styles.simTitle}>
                    <FileText size={18} color="var(--primary-color)" />
                    {t("division.theoretical_est")}
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginTop: '1rem' }}>
                    {/* Lot A */}
                    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.75)', borderRadius: '12px', padding: '0.9rem', border: '1px solid rgba(121, 160, 129, 0.25)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ backgroundColor: 'var(--primary-color)', color: 'white', fontWeight: '800', fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '20px' }}>
                          LOT A
                        </span>
                        <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary-color)' }}>
                          {surfaceLotA} m²
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: isLotASurfaceValid ? '#15803d' : '#b45309', display: 'flex', alignItems: 'flex-start', gap: '0.3rem', lineHeight: '1.3', marginTop: '0.4rem' }}>
                        <span>{isLotASurfaceValid ? '✅' : '⚠️'}</span>
                        <span>{isLotASurfaceValid ? 'Surface favorable (> 150 m²)' : 'Surface réduite (à valider)'}</span>
                      </div>
                    </div>

                    {/* Lot B */}
                    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.75)', borderRadius: '12px', padding: '0.9rem', border: '1px solid rgba(37, 99, 235, 0.25)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ backgroundColor: '#2563eb', color: 'white', fontWeight: '800', fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '20px' }}>
                          LOT B
                        </span>
                        <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary-color)' }}>
                          {surfaceLotB} m²
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: isLotBSurfaceValid ? '#15803d' : '#b45309', display: 'flex', alignItems: 'flex-start', gap: '0.3rem', lineHeight: '1.3', marginTop: '0.4rem' }}>
                        <span>{isLotBSurfaceValid ? '✅' : '⚠️'}</span>
                        <span>{isLotBSurfaceValid ? 'Surface favorable (> 150 m²)' : 'Surface réduite (à valider)'}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.accessCheck} style={{ marginTop: '1rem' }}>
                    <label className={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={hasAccess} 
                        onChange={(e) => setHasAccess(e.target.checked)}
                        className={styles.checkboxInput}
                      />
                      <span>{t("division.has_access")}</span>
                    </label>
                  </div>

                  {/* Bouton d'envoi du dessin vers le formulaire de contact */}
                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <button
                      type="button"
                      onClick={handleAttachClick}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        backgroundColor: attachedSuccess ? '#15803d' : 'var(--primary-color)',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(121, 160, 129, 0.3)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {attachedSuccess ? (
                        <>✅ Dessin joint au message ci-dessus !</>
                      ) : (
                        <>📩 Transmettre ce dessin à mon message</>
                      )}
                    </button>
                  </div>
                </GlassCard>

              </motion.div>
            ) : (
              <GlassCard className={styles.emptyStateCard}>
                <MapPin size={32} color="var(--primary-color)" style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', margin: 0 }}>
                  {t("division.ready_to_cut_desc")}
                </p>
              </GlassCard>
            )}
          </AnimatePresence>

        </div>

        {/* Bloc Carte Leaflet (2/3) */}
        <div className={`${styles.mapWrapper} ${hideHeader ? styles.embeddedMap : ''}`} style={{ position: 'relative' }}>
          
          {/* Sélecteur de couches de carte (Style Géoportail / IGN / DGFiP) */}
          <div style={{
            position: 'absolute',
            top: '0.8rem',
            right: '0.8rem',
            zIndex: 1000,
            display: 'flex',
            gap: '0.35rem',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            padding: '0.35rem',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.1)'
          }}>
            <button
              type="button"
              onClick={() => setMapMode('geoportail')}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: mapMode === 'geoportail' ? 'var(--primary-color)' : 'transparent',
                color: mapMode === 'geoportail' ? 'white' : '#334155',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
              title="Vue Géoportail (Satellite + Rues IGN + Cadastre DGFiP)"
            >
              🛰️ Géoportail
            </button>
            <button
              type="button"
              onClick={() => setMapMode('plan')}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: mapMode === 'plan' ? 'var(--primary-color)' : 'transparent',
                color: mapMode === 'plan' ? 'white' : '#334155',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Vue Plan Cadastral"
            >
              🗺️ Plan
            </button>
            <button
              type="button"
              onClick={() => setMapMode('satellite')}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: mapMode === 'satellite' ? 'var(--primary-color)' : 'transparent',
                color: mapMode === 'satellite' ? 'white' : '#334155',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Vue Satellite Pur"
            >
              🌍 Satellite
            </button>
          </div>

          <MapContainer 
            center={mapCenter} 
            zoom={zoomLevel} 
            maxZoom={22}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            attributionControl={false}
          >
            <ChangeView center={mapCenter} zoom={zoomLevel} bounds={parcelBounds} />
            <MapEventsHandler onMapClick={handleMapClick} />
            
            {/* 🎯 Mode Géoportail (Par défaut) : Satellite Orthophoto + Noms des rues IGN + Cadastre DGFiP */}
            {mapMode === 'geoportail' && (
              <>
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={22}
                  maxNativeZoom={19}
                  opacity={0.88}
                  attribution="Esri World Imagery / Orthophotos"
                />

                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
                  maxZoom={22}
                  maxNativeZoom={20}
                  subdomains="abcd"
                  zIndex={500}
                />

                <TileLayer
                  url="https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=CADASTRALPARCELS.PARCELLAIRE_EXPRESS&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png"
                  maxZoom={22}
                  maxNativeZoom={20}
                  opacity={0.85}
                  zIndex={600}
                />

                <TileLayer
                  url="https://tms.cadastral.openstreetmap.fr/tms/1.0.0/parcel/{z}/{x}/{y}.png"
                  tms={true}
                  opacity={0.7}
                  maxZoom={22}
                  maxNativeZoom={20}
                  zIndex={610}
                />
              </>
            )}

            {/* Mode Plan Standard Cadastral */}
            {mapMode === 'plan' && (
              <>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
                  maxZoom={22}
                  maxNativeZoom={20}
                />
                <TileLayer
                  url="https://tms.cadastral.openstreetmap.fr/tms/1.0.0/parcel/{z}/{x}/{y}.png"
                  tms={true}
                  opacity={0.65}
                  maxZoom={22}
                  maxNativeZoom={20}
                />
              </>
            )}

            {/* Mode Satellite Pur */}
            {mapMode === 'satellite' && (
              <>
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={22}
                  maxNativeZoom={19}
                  opacity={1.0}
                />
                <TileLayer
                  url="https://tms.cadastral.openstreetmap.fr/tms/1.0.0/parcel/{z}/{x}/{y}.png"
                  tms={true}
                  opacity={0.8}
                  maxZoom={22}
                  maxNativeZoom={20}
                />
              </>
            )}

            {/* Rendu dynamique du GeoJSON de la parcelle sélectionnée */}
            {cadastreGeoJson && (
              <GeoJSON
                key={JSON.stringify(cadastreGeoJson)}
                data={cadastreGeoJson}
                style={{
                  color: 'var(--primary-color)',
                  weight: 3,
                  fillColor: 'var(--primary-color)',
                  fillOpacity: 0.2,
                  dashArray: ''
                }}
              />
            )}

            {/* Mode 1: Ligne pointillée automatique */}
            {drawMode === 'auto' && divisionLinePoints && (
              <Polyline
                positions={divisionLinePoints}
                pathOptions={{
                  color: '#ef4444',
                  weight: 4,
                  dashArray: '8, 8',
                  dashOffset: '0',
                }}
              />
            )}

            {/* Mode 2: Tracé 2 Points */}
            {drawMode === 'two_points' && (
              <>
                {twoPoints.map((pt, idx) => (
                  <Marker key={`pt-${idx}`} position={pt}>
                    <Popup>
                      Point {idx + 1} de coupe sur-mesure
                    </Popup>
                  </Marker>
                ))}
                {twoPoints.length === 2 && (
                  <Polyline
                    positions={twoPoints}
                    pathOptions={{
                      color: '#ef4444',
                      weight: 4,
                      dashArray: '6, 6'
                    }}
                  />
                )}
              </>
            )}

            {/* Mode 3: Tracé Polygone Libre */}
            {drawMode === 'polygon' && (
              <>
                {polygonPoints.map((pt, idx) => (
                  <Marker key={`poly-pt-${idx}`} position={pt}>
                    <Popup>
                      Sommet n°{idx + 1} du polygone
                    </Popup>
                  </Marker>
                ))}
                {polygonPoints.length >= 2 && polygonPoints.length < 3 && (
                  <Polyline
                    positions={polygonPoints}
                    pathOptions={{
                      color: '#10b981',
                      weight: 3,
                      dashArray: '4, 4'
                    }}
                  />
                )}
                {polygonPoints.length >= 3 && (
                  <Polygon
                    positions={polygonPoints}
                    pathOptions={{
                      color: '#10b981',
                      weight: 3,
                      fillColor: '#10b981',
                      fillOpacity: 0.3
                    }}
                  />
                )}
              </>
            )}

            {/* Marqueur de l'adresse recherchée */}
            {selectedAddress && (
              <Marker position={mapCenter}>
                <Popup>
                  <div style={{ padding: '5px', fontSize: '0.85rem' }}>
                    <strong style={{ color: 'var(--primary-color)' }}>{t("division.terrain_selected")}</strong>
                    <p style={{ margin: '3px 0 0 0' }}>{selectedAddress}</p>
                    {cadastreInfo && (
                      <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: 'var(--text-light)' }}>
                        {t("cadastre.section")} {cadastreInfo.section} n°{cadastreInfo.numero} - {cadastreInfo.surface} m²
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

      </div>

    </div>
  );
}
