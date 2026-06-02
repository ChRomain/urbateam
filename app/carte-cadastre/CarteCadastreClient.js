'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, CheckCircle, AlertTriangle, FileText, ArrowRight, Loader } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import GlassCard from '../../components/GlassCard';
import { useLanguage } from '../../context/LanguageContext';
import 'leaflet/dist/leaflet.css';
import styles from './CarteCadastreClient.module.css';

import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap, useMapEvents } from 'react-leaflet';

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
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
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

// Formule de Haversine pour calculer la distance entre deux coordonnées GPS
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Rayon de la Terre en mètres
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance en mètres
}

export default function CarteCadastreClient({ projects = [] }) {
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
  
  // État de proximité Supabase
  const [nearbyProject, setNearbyProject] = useState(null);

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

  // Recherche d'adresses (API Adresse de l'État Français - OpenData Gratuit)
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
    setZoomLevel(18); // Zoom maximum sur la parcelle
    setCadastreGeoJson(null);
    setCadastreInfo(null);
    setNearbyProject(null);
    setErrorMsg('');
    setLoadingCadastre(true);

    try {
      // 1. Interroger l'API Cadastre locale (Proxy vers l'IGN)
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
            surface: props.contenance ? `${props.contenance} m²` : 'Inconnue',
          });

          // 2. Vérifier dans notre base de données Supabase si un projet Urbateam est situé à proximité (< 150m)
          // Filtrer les projets avec des coordonnées valides
          const geoProjects = projects.filter(p => p.latitude && p.longitude);
          let closestProject = null;
          let minDistance = 150; // Seuil de 150 mètres

          geoProjects.forEach(proj => {
            const dist = getDistance(lat, lon, proj.latitude, proj.longitude);
            if (dist < minDistance) {
              minDistance = dist;
              closestProject = { ...proj, distance: Math.round(dist) };
            }
          });

          if (closestProject) {
            setNearbyProject(closestProject);
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

  // Clic direct sur la carte pour obtenir les infos de la parcelle
  const handleMapClick = async (latlng) => {
    const lat = latlng.lat;
    const lon = latlng.lng;
    
    setSelectedAddress(`Point sélectionné : ${lat.toFixed(5)}, ${lon.toFixed(5)}`);
    setMapCenter([lat, lon]);
    setZoomLevel(18); // Zoom sur la zone
    setCadastreGeoJson(null);
    setCadastreInfo(null);
    setNearbyProject(null);
    setErrorMsg('');
    setLoadingCadastre(true);

    try {
      // 1. Récupérer la parcelle de l'IGN via le proxy local
      const cadastreRes = await fetch(`/api/cadastre?action=parcel&lat=${lat}&lon=${lon}`);

      if (cadastreRes.ok) {
        const cadastreData = await cadastreRes.json();
        
        if (cadastreData.features && cadastreData.features.length > 0) {
          const parcelFeature = cadastreData.features[0];
          setCadastreGeoJson(parcelFeature.geometry);
          
          const props = parcelFeature.properties;
          
          // Essayer d'obtenir l'adresse textuelle pour ce point via le proxy local
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
            surface: props.contenance ? `${props.contenance} m²` : 'Inconnue',
          });

          // 2. Vérifier dans notre base de données Supabase si un projet Urbateam est situé à proximité (< 150m)
          const geoProjects = projects.filter(p => p.latitude && p.longitude);
          let closestProject = null;
          let minDistance = 150;

          geoProjects.forEach(proj => {
            const dist = getDistance(lat, lon, proj.latitude, proj.longitude);
            if (dist < minDistance) {
              minDistance = dist;
              closestProject = { ...proj, distance: Math.round(dist) };
            }
          });

          if (closestProject) {
            setNearbyProject(closestProject);
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

  // Pré-remplit le formulaire de contact avec les infos de la parcelle
  const getPreFilledContactUrl = () => {
    if (!cadastreInfo || !selectedAddress) return '/contact';
    const subject = `Demande de devis - Parcelle ${cadastreInfo.section} n°${cadastreInfo.numero} - ${cadastreInfo.commune}`;
    const message = `Bonjour,\n\nJe souhaiterais obtenir des informations et un devis concernant ma parcelle cadastrale située à l'adresse suivante : ${selectedAddress}.\n\nRéférences cadastrales :\n- Section : ${cadastreInfo.section}\n- Numéro de parcelle : ${cadastreInfo.numero}\n- Commune : ${cadastreInfo.commune}\n- Surface estimée : ${cadastreInfo.surface}\n\nMerci d'avance pour votre retour.`;
    return `/contact?subject=${encodeURIComponent(subject)}&message=${encodeURIComponent(message)}`;
  };

  return (
    <div className="container py-section">
      <PageHeader 
        title={t("cadastre.title")} 
        subtitle={t("cadastre.subtitle")} 
      />

      <div className={styles.layout}>
        
        {/* Panel de contrôle et recherche (1/3) */}
        <div className={styles.sidebar}>
          
          <GlassCard style={{ padding: '2rem' }}>
            <h3 className={styles.searchHeader}>
              <Search size={20} color="var(--accent-color)" />
              {t("cadastre.search_address")}
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
              {t("cadastre.search_info")}
            </p>
          </GlassCard>

          {/* Panel d'informations cadastrales */}
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
                  <span className={styles.loadingText}>{t("cadastre.loading_text")}</span>
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
                key="details-cadastre"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={styles.sidebar}
              >
                <GlassCard className={styles.ficheCard}>
                  <h4 className={styles.ficheTitle}>
                    <FileText size={18} />
                    {t("cadastre.parcel_sheet")}
                  </h4>
                  
                  <div className={styles.ficheGrid}>
                    <div className={styles.ficheItem}>
                      <span className={styles.ficheLabel}>{t("cadastre.commune")}</span>
                      <strong className={styles.ficheValue}>{cadastreInfo.commune}</strong>
                    </div>
                    <div className={styles.ficheItem}>
                      <span className={styles.ficheLabel}>{t("cadastre.section")}</span>
                      <strong className={styles.ficheValue}>{cadastreInfo.section}</strong>
                    </div>
                    <div className={styles.ficheItem}>
                      <span className={styles.ficheLabel}>{t("cadastre.parcel_number")}</span>
                      <strong className={styles.ficheValue}>{cadastreInfo.numero}</strong>
                    </div>
                    <div className={styles.ficheItem}>
                      <span className={styles.ficheLabel}>{t("cadastre.tax_surface")}</span>
                      <strong className={styles.ficheValue}>{cadastreInfo.surface} m²</strong>
                    </div>
                  </div>
                </GlassCard>

                {/* Panel de statut d'historique (Supabase Match) */}
                <GlassCard className={styles.statusCard} style={{ borderLeft: `5px solid ${nearbyProject ? 'var(--primary-color)' : 'var(--accent-color)'}` }}>
                  {nearbyProject ? (
                    <div>
                      <div className={styles.statusSuccessTitle}>
                        <CheckCircle size={20} />
                        {t("cadastre.known_parcel")}
                      </div>
                      <p className={styles.statusSuccessText}>
                        {t("cadastre.nearby_project")
                          .replace("{distance}", nearbyProject.distance)
                          .replace("{name}", nearbyProject.title)}
                      </p>
                      <a href={`/projets/${nearbyProject.slug}`} className="btn btn-outline" style={{ width: '100%', fontSize: '0.8rem', textAlign: 'center', textDecoration: 'none' }}>
                        {t("cadastre.consulter_projet")}
                      </a>
                    </div>
                  ) : (
                    <div>
                      <div className={styles.statusAlertTitle}>
                        <AlertTriangle size={20} color="var(--accent-color)" />
                        {t("cadastre.no_nearby_project")}
                      </div>
                      <p className={styles.statusAlertText}>
                        {t("cadastre.no_recent_op")}
                      </p>
                      <a 
                        href={getPreFilledContactUrl()} 
                        className={`btn ${styles.prefilledBtn}`}
                      >
                        {t("cadastre.request_quote")}
                        <ArrowRight size={16} />
                      </a>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div
                key="empty-cadastre"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <GlassCard className={styles.emptyCard}>
                  <div className={styles.emptyIconWrapper}>
                    <MapPin size={24} color="#94a3b8" />
                  </div>
                  <h4 className={styles.emptyTitle}>{t("cadastre.ready_title")}</h4>
                  <p className={styles.emptyText}>
                    {t("cadastre.ready_desc")}
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
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <ChangeView center={mapCenter} zoom={zoomLevel} />
            <MapEventsHandler onMapClick={handleMapClick} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
            />
            
            {/* Couche transparente officielle du cadastre (OpenStreetMap France) */}
            <TileLayer
              attribution='&copy; Direction générale des Finances publiques - Cadastre'
              url="https://tms.cadastral.openstreetmap.fr/tms/1.0.0/parcel/{z}/{x}/{y}.png"
              tms={true}
              opacity={0.6}
            />

            {/* Rendu dynamique du GeoJSON de la parcelle sélectionnée */}
            {cadastreGeoJson && (
              <GeoJSON
                key={JSON.stringify(cadastreGeoJson)}
                data={cadastreGeoJson}
                style={{
                  color: 'var(--accent-color)',
                  weight: 3,
                  fillColor: 'var(--accent-color)',
                  fillOpacity: 0.25,
                  dashArray: '5, 5'
                }}
              />
            )}

            {/* Marqueur de l'adresse recherchée */}
            {selectedAddress && (
              <Marker position={mapCenter}>
                <Popup>
                  <div style={{ padding: '5px', fontSize: '0.85rem' }}>
                    <strong style={{ color: 'var(--primary-color)' }}>{t("cadastre.address_searched")}</strong>
                    <p style={{ margin: '3px 0 0 0' }}>{selectedAddress}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Marqueurs des projets Urbateam à proximité pour donner de la consistance */}
            {projects.filter(p => p.latitude && p.longitude).map((proj) => (
              <Marker 
                key={`proj-${proj.id}`} 
                position={[proj.latitude, proj.longitude]}
                icon={new L.Icon({
                  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
                  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowSize: [41, 41]
                })}
              >
                <Popup>
                  <div style={{ padding: '5px', fontSize: '0.8rem' }}>
                    <strong style={{ color: 'var(--secondary-color)' }}>{proj.title}</strong>
                    <p style={{ margin: '3px 0 5px 0' }}>📍 {proj.location}</p>
                    <a href={`/projets/${proj.slug}`} style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                      {t("cadastre.view_project_sheet")}
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

      </div>

      {/* Guide RSE et Foncier en footer de page */}
      <div className={styles.footerGrid}>
        <GlassCard>
          <h4 className={styles.footerCardTitle}>
            {t("cadastre.faq_title_2")}
          </h4>
          <p className={styles.footerCardText}>
            {t("cadastre.faq_desc_2")}
          </p>
        </GlassCard>

        <GlassCard>
          <h4 className={styles.footerCardTitle}>
            {t("cadastre.faq_title_1")}
          </h4>
          <p className={styles.footerCardText}>
            {t("cadastre.faq_desc_1")}
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
