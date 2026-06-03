'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, CheckCircle, AlertTriangle, FileText, ArrowRight, Loader, Ruler, RotateCw, Move } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import GlassCard from '../../components/GlassCard';
import { useLanguage } from '../../context/LanguageContext';
import 'leaflet/dist/leaflet.css';
import styles from './SimulateurDivisionClient.module.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap, useMapEvents, Polyline } from 'react-leaflet';
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

// Helper to get the bounding box of a Geometry
function getGeometryBounds(geometry) {
  let minLat = Infinity, maxLat = -Infinity;
  let minLon = Infinity, maxLon = -Infinity;
  
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
  
  // Use a 40x40 grid for high-precision real-time calculations
  const gridSize = 40;
  let countA = 0;
  let countB = 0;
  
  const lat = centroid[0];
  const lon = centroid[1];
  
  const angleRad = (splitAngle * Math.PI) / 180;
  const perpAngleRad = angleRad + Math.PI / 2;
  
  // Keep physical conversion factor aligned with the polyline representation
  const latShift = splitOffset * 0.000005 * Math.sin(perpAngleRad);
  const lonShift = splitOffset * 0.000008 * Math.cos(perpAngleRad);
  
  const lineLat = lat + latShift;
  const lineLon = lon + lonShift;
  
  const normalY = -Math.cos(angleRad);
  const normalX = Math.sin(angleRad);
  
  for (let i = 0; i <= gridSize; i++) {
    const ptLat = minLat + (maxLat - minLat) * (i / gridSize);
    for (let j = 0; j <= gridSize; j++) {
      const ptLon = minLon + (maxLon - minLon) * (j / gridSize);
      const point = [ptLat, ptLon];
      
      if (isPointInGeometry(point, geometry)) {
        const dotProduct = (ptLat - lineLat) * normalY + (ptLon - lineLon) * normalX;
        if (dotProduct > 0) {
          countA++;
        } else {
          countB++;
        }
      }
    }
  }
  
  const totalPoints = countA + countB;
  if (totalPoints === 0) {
    return { areaA: Math.round(totalArea / 2), areaB: Math.round(totalArea / 2) };
  }
  
  const areaA = Math.round(totalArea * (countA / totalPoints));
  const areaB = Math.round(totalArea * (countB / totalPoints));
  
  return { areaA, areaB };
}


export default function SimulateurDivisionClient() {
  const { t } = useLanguage();
  
  // États de recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [apiError, setApiError] = useState(false);
  
  // États cartographiques & Cadastre
  const [mapCenter, setMapCenter] = useState([48.3903, -4.4861]);
  const [zoomLevel, setZoomLevel] = useState(9);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [cadastreGeoJson, setCadastreGeoJson] = useState(null);
  const [cadastreInfo, setCadastreInfo] = useState(null);
  const [loadingCadastre, setLoadingCadastre] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [centroid, setCentroid] = useState(null);

  // Curseurs de simulation de division
  const [splitAngle, setSplitAngle] = useState(90); // Angle en degrés (90° = vertical)
  const [splitOffset, setSplitOffset] = useState(0); // Déplacement latéral de la ligne (-50 à +50)
  const [hasAccess, setHasAccess] = useState(true); // Est-ce que les deux lots ont un accès voirie ?

  // Formulaire de contact / capture de leads
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientMessage, setClientMessage] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState('');

  const autocompleteRef = useRef(null);

  useEffect(() => {
    // Fermer les suggestions au clic en dehors
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
    }, 300); // Debounce de 300ms

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
    setErrorMsg('');
    setLoadingCadastre(true);
    setLeadSuccess(false);

    try {
      // Interroger l'API Cadastre locale (Proxy vers l'IGN)
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
            surface: props.contenance || 500, // Contenance fiscale en m²
          });

          // Calculer le barycentre de la parcelle pour ancrer la ligne
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

  // Clic direct sur la carte pour obtenir les infos de la parcelle
  const handleMapClick = async (latlng) => {
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
    setErrorMsg('');
    setLoadingCadastre(true);
    setLeadSuccess(false);

    try {
      // Récupérer la parcelle de l'IGN via le proxy local
      const cadastreRes = await fetch(`/api/cadastre?action=parcel&lat=${lat}&lon=${lon}`);

      if (cadastreRes.ok) {
        const cadastreData = await cadastreRes.json();
        
        if (cadastreData.features && cadastreData.features.length > 0) {
          const parcelFeature = cadastreData.features[0];
          setCadastreGeoJson(parcelFeature.geometry);
          
          const props = parcelFeature.properties;
          
          // Reverse Geocoding gratuit via le proxy local
          let reverseLabel = `Parcelle ${props.section || ''} n°${props.numero || ''}`;
          try {
            const reverseRes = await fetch(`/api/cadastre?action=reverse&lat=${lat}&lon=${lon}`);
            if (reverseRes.ok) {
              const reverseData = await reverseRes.json();
              if (reverseData.features && reverseData.features.length > 0) {
                reverseLabel = reverseData.features[0].properties.label;
              }
            }
          } catch (e) {
            console.warn("Reverse geocoding failed, using parcel name.", e);
          }
          
          setSelectedAddress(reverseLabel);
          setCadastreInfo({
            numero: props.numero || 'Inconnu',
            section: props.section || 'Inconnue',
            code_commune: props.code_insee || 'Inconnu',
            commune: props.nom_com || 'Inconnue',
            surface: props.contenance || 500,
          });

          // Calculer le barycentre de la parcelle pour ancrer la ligne
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

  // Soumission de la demande de simulation (Capture de leads)
  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (!clientName || !clientEmail) {
      setLeadError('Veuillez renseigner au moins votre nom et votre adresse e-mail.');
      return;
    }

    setSubmittingLead(true);
    setLeadError('');

    try {
      const surfaceTotale = parseFloat(cadastreInfo.surface);
      const lotASurface = surfaceLotA;
      const lotBSurface = surfaceLotB;

      const { error } = await supabase
        .from('simulations')
        .insert([{
          address: selectedAddress,
          parcel_ref: `Section ${cadastreInfo.section} n°${cadastreInfo.numero} (${cadastreInfo.commune})`,
          total_surface: `${surfaceTotale} m²`,
          lot_a_surface: `${lotASurface} m²`,
          lot_b_surface: `${lotBSurface} m²`,
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
      console.error('Erreur soumission simulation :', err);
      setLeadError("Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.");
    } finally {
      setSubmittingLead(false);
    }
  };

  // Moteur géométrique de découpe visuelle en direct
  // Calcule les coordonnées de la ligne de division en fonction de l'angle et de l'offset
  const getDivisionLinePoints = () => {
    if (!centroid) return null;
    const lat = centroid[0];
    const lon = centroid[1];
    
    // Conversion de l'angle en radians
    const angleRad = (splitAngle * Math.PI) / 180;
    // L'angle perpendiculaire sert à appliquer le déplacement (offset)
    const perpAngleRad = angleRad + Math.PI / 2;
    
    // Multiplicateurs géographiques de conversion (approximation bretonne)
    const latShift = splitOffset * 0.000005 * Math.sin(perpAngleRad);
    const lonShift = splitOffset * 0.000008 * Math.cos(perpAngleRad);
    
    const lineLat = lat + latShift;
    const lineLon = lon + lonShift;
    
    // Détermination de deux points éloignés pour tracer une longue ligne de coupe
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

  // Variables calculées pour l'affichage de constructibilité
  const surfaceTotale = cadastreInfo ? parseFloat(cadastreInfo.surface) : 0;
  
  // Calcul géométrique en temps réel de la répartition des surfaces
  const { areaA, areaB } = computeSplitAreas(cadastreGeoJson, surfaceTotale, splitAngle, splitOffset, centroid);
  const surfaceLotA = areaA;
  const surfaceLotB = areaB;

  const splitRatioValA = surfaceTotale > 0 ? Math.round((surfaceLotA / surfaceTotale) * 100) : 50;
  const splitRatioValB = 100 - splitRatioValA;

  // Calcul des limites (bounds) de la parcelle pour l'ajustement dynamique de la carte
  const parcelBounds = useMemo(() => {
    if (!cadastreGeoJson) return null;
    const { minLat, maxLat, minLon, maxLon } = getGeometryBounds(cadastreGeoJson);
    if (minLat === Infinity || maxLat === -Infinity) return null;
    return [
      [minLat, minLon],
      [maxLat, maxLon]
    ];
  }, [cadastreGeoJson]);

  // Réglementation (PLU) - Pastilles
  const isLotASurfaceValid = surfaceLotA >= 150;
  const isLotBSurfaceValid = surfaceLotB >= 150;
  const isFormValid = isLotASurfaceValid && isLotBSurfaceValid && hasAccess;

  return (
    <div className="container py-section">
      <PageHeader 
        title={t("division.title")} 
        subtitle={t("division.subtitle")} 
      />

      <div className={styles.layout}>
        
        {/* Panel de contrôle et simulations (1/3) */}
        <div className={styles.sidebar}>
          
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
                {/* Outils de division */}
                <GlassCard className={styles.ficheCard}>
                  <h4 className={styles.simTitle}>
                    <Ruler size={18} color="var(--accent-color)" />
                    {t("division.divider_tool")}
                  </h4>

                  {/* Visualisation : Ratio de découpe réel */}
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

                  {/* Slider 2 : Angle de la ligne */}
                  <div className={styles.controlGroup}>
                    <label className={styles.controlLabel}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <RotateCw size={14} /> {t("division.split_angle")}
                      </span>
                      <span className={styles.controlVal}>{splitAngle}°</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="180"
                      value={splitAngle}
                      onChange={(e) => setSplitAngle(parseInt(e.target.value))}
                      className={styles.sliderInput}
                    />
                  </div>

                  {/* Slider 3 : Déplacement de la ligne */}
                  <div className={styles.controlGroup}>
                    <label className={styles.controlLabel}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Move size={14} /> {t("division.split_offset")}
                      </span>
                      <span className={styles.controlVal}>{splitOffset}m</span>
                    </label>
                    <input
                      type="range"
                      min="-60"
                      max="60"
                      value={splitOffset}
                      onChange={(e) => setSplitOffset(parseInt(e.target.value))}
                      className={styles.sliderInput}
                    />
                  </div>

                  {/* Option : Accès voirie */}
                  <div className={styles.controlGroup} style={{ marginTop: '1.2rem' }}>
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
                </GlassCard>

                {/* Résultats des calculs */}
                <GlassCard className={styles.ficheCard}>
                  <h4 className={styles.simTitle}>
                    <FileText size={18} color="var(--primary-color)" />
                    {t("division.theoretical_est")}
                  </h4>

                  <div className={styles.lotResults}>
                    <div className={styles.lotCard}>
                      <div className={`${styles.lotName} ${styles.lotNameA}`}>{t("division.lot_a")}</div>
                      <div className={styles.lotArea}>{surfaceLotA} m²</div>
                    </div>
                    <div className={styles.lotCard}>
                      <div className={`${styles.lotName} ${styles.lotNameB}`}>{t("division.lot_b")}</div>
                      <div className={styles.lotArea}>{surfaceLotB} m²</div>
                    </div>
                  </div>

                  <div className={styles.checklist}>
                    <div className={`${styles.checkItem} ${isLotASurfaceValid ? styles.checkItemValid : styles.checkItemInvalid}`}>
                      {isLotASurfaceValid ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                      <span>
                        {isLotASurfaceValid 
                          ? t("division.lot_a_constructible").replace("{surface}", surfaceLotA) 
                          : t("division.lot_a_not_constructible").replace("{surface}", surfaceLotA)}
                      </span>
                    </div>
                    <div className={`${styles.checkItem} ${isLotBSurfaceValid ? styles.checkItemValid : styles.checkItemInvalid}`}>
                      {isLotBSurfaceValid ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                      <span>
                        {isLotBSurfaceValid 
                          ? t("division.lot_b_constructible").replace("{surface}", surfaceLotB) 
                          : t("division.lot_b_not_constructible").replace("{surface}", surfaceLotB)}
                      </span>
                    </div>
                    <div className={`${styles.checkItem} ${hasAccess ? styles.checkItemValid : styles.checkItemInvalid}`}>
                      {hasAccess ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                      <span>
                        {hasAccess ? t("division.access_networks") : t("division.access_networks_invalid")}
                      </span>
                    </div>
                  </div>
                </GlassCard>

                {/* Formulaire de lead */}
                <GlassCard className={styles.ficheCard}>
                  {leadSuccess ? (
                    <div className={styles.successCard}>
                      <div className={styles.successTitle}>
                        <CheckCircle size={22} /> {t("division.registered_sim")}
                      </div>
                      <p className={styles.successText}>
                        {t("division.registered_sim_desc")}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitLead}>
                      <h4 className={styles.formTitle}>{t("division.free_study")}</h4>
                      <input
                        type="text"
                        placeholder={t("division.full_name")}
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className={styles.formInput}
                        required
                      />
                      <input
                        type="email"
                        placeholder={t("division.email_addr")}
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className={styles.formInput}
                        required
                      />
                      <input
                        type="tel"
                        placeholder={t("division.phone_num")}
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className={styles.formInput}
                      />
                      <textarea
                        placeholder={t("division.comments_placeholder")}
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
                        className={styles.submitBtn}
                      >
                        {submittingLead ? <Loader size={16} className="spin" /> : <ArrowRight size={16} />}
                        {t("division.send_sim")}
                      </button>
                    </form>
                  )}
                </GlassCard>

              </motion.div>
            ) : (
              <motion.div
                key="empty-sim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <GlassCard className={styles.emptyCard}>
                  <div className={styles.emptyIconWrapper}>
                    <Ruler size={24} color="#94a3b8" />
                  </div>
                  <h4 className={styles.emptyTitle}>{t("division.ready_to_cut")}</h4>
                  <p className={styles.emptyText}>
                    {t("division.ready_to_cut_desc")}
                  </p>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bloc Carte Leaflet (2/3) */}
        <div className={styles.mapWrapper}>
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
            <TileLayer
              url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
              maxZoom={22}
              maxNativeZoom={20}
            />
            
            {/* Couche transparente officielle du cadastre (OpenStreetMap France) */}
            <TileLayer
              url="https://tms.cadastral.openstreetmap.fr/tms/1.0.0/parcel/{z}/{x}/{y}.png"
              tms={true}
              opacity={0.6}
              maxZoom={22}
              maxNativeZoom={20}
            />

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

            {/* Ligne pointillée de division virtuelle interactive */}
            {divisionLinePoints && (
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

      {/* Note simulateur */}
      <div className={styles.simulatorNote}>
        <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
        <p>{t("division.simulator_note")}</p>
      </div>

      {/* Guide RSE et Division en footer de page */}
      <div className={styles.footerGrid}>
        <GlassCard>
          <h4 className={styles.footerCardTitle}>
            {t("division.steps_title")}
          </h4>
          <p className={styles.footerCardText}>
            {t("division.steps_desc")}
          </p>
        </GlassCard>

        <GlassCard>
          <h4 className={styles.footerCardTitle}>
            {t("division.viability_title")}
          </h4>
          <p className={styles.footerCardText}>
            {t("division.viability_desc")}
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
