'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  MapPin, 
  Search, 
  Layers, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  RefreshCw, 
  FileText, 
  Ruler, 
  Maximize2 
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Polyline, Polygon, useMap } from 'react-leaflet';

// Fix icones Leaflet
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

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

// Helper calcul distance
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

export default function SimulationViewerManager({ darkMode = false }) {
  const [jsonInput, setJsonInput] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [parseError, setParseError] = useState('');
  const [cadastreGeoJson, setCadastreGeoJson] = useState(null);
  const [loadingCadastre, setLoadingCadastre] = useState(false);
  const [mapMode, setMapMode] = useState('geoportail');

  // Exemple de test rapide avec l'adresse 8 rue Bel-Air, 29800 Landerneau
  const sampleExample = {
    type: 'URBATEAM_DRAWING_SIMULATION',
    version: '1.0',
    timestamp: new Date().toISOString(),
    selectedAddress: '8 rue Bel-Air, 29800 Landerneau',
    mapCenter: [48.453426, -4.252833],
    zoomLevel: 21,
    cadastreInfo: {
      section: 'AK',
      numero: '0087',
      commune: 'Landerneau',
      surface: 820
    },
    drawMode: 'two_points',
    twoPoints: [[48.453500, -4.252950], [48.453350, -4.252700]],
    polygonPoints: [],
    splitAngle: 90,
    splitOffset: 0,
    hasAccess: true,
    surfaceLotA: 420,
    surfaceLotB: 400,
    twoPointsDistance: 23.4,
    polygonArea: 0
  };

  const handleLoadSample = () => {
    setJsonInput(JSON.stringify(sampleExample, null, 2));
    handleParse(JSON.stringify(sampleExample));
  };

  const handleParse = async (inputToParse) => {
    const raw = inputToParse !== undefined ? inputToParse : jsonInput;
    setParseError('');
    setParsedData(null);
    setCadastreGeoJson(null);

    if (!raw || !raw.trim()) {
      setParseError('Veuillez coller le contenu JSON de la simulation.');
      return;
    }

    try {
      // Extraire le JSON même si entouré de texte
      let jsonStr = raw.trim();
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
      }

      const data = JSON.parse(jsonStr);
      setParsedData(data);

      // Charger le GeoJSON de la parcelle depuis l'API Cadastre si les coordonnées sont disponibles
      if (data.mapCenter && data.mapCenter.length === 2) {
        setLoadingCadastre(true);
        try {
          const res = await fetch(`/api/cadastre?action=parcel&lat=${data.mapCenter[0]}&lon=${data.mapCenter[1]}`);
          if (res.ok) {
            const cadData = await res.json();
            if (cadData.features && cadData.features.length > 0) {
              setCadastreGeoJson(cadData.features[0].geometry);
            }
          }
        } catch (e) {
          console.error('Erreur chargement cadastre viewer:', e);
        } finally {
          setLoadingCadastre(false);
        }
      }

    } catch (err) {
      console.error('Erreur parse JSON simulation:', err);
      setParseError('Format de données invalide. Assurez-vous de coller l\'intégralité du code JSON reçu.');
    }
  };

  // Calcul des points de la ligne automatique si drawMode === 'auto'
  const getDivisionLinePoints = () => {
    if (!parsedData || !parsedData.mapCenter) return null;
    const lat = parsedData.mapCenter[0];
    const lon = parsedData.mapCenter[1];
    const angleRad = ((parsedData.splitAngle || 90) * Math.PI) / 180;
    const perpAngleRad = angleRad + Math.PI / 2;
    const offset = parsedData.splitOffset || 0;
    
    const latShift = offset * 0.000005 * Math.sin(perpAngleRad);
    const lonShift = offset * 0.000008 * Math.cos(perpAngleRad);
    
    const lineLat = lat + latShift;
    const lineLon = lon + lonShift;
    
    return [
      [lineLat + 0.0025 * Math.sin(angleRad), lineLon + 0.0035 * Math.cos(angleRad)],
      [lineLat - 0.0025 * Math.sin(angleRad), lineLon - 0.0035 * Math.cos(angleRad)]
    ];
  };

  const autoLinePoints = parsedData && parsedData.drawMode === 'auto' ? getDivisionLinePoints() : null;

  return (
    <div style={{ padding: '1.5rem', color: darkMode ? '#f8fafc' : '#0f172a' }}>
      
      {/* En-tête de la fonctionnalité */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary-color)' }}>
            <Layers size={26} /> Reconstructeur de Dessin / Projet Client
          </h2>
          <p style={{ fontSize: '0.88rem', color: darkMode ? '#94a3b8' : '#64748b', margin: '0.2rem 0 0 0' }}>
            Collez le code de simulation reçu par email pour afficher instantanément le projet du client sur la carte satellite.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          style={{
            padding: '0.5rem 0.9rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: darkMode ? '#334155' : 'white',
            color: darkMode ? 'white' : '#1e293b',
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <RefreshCw size={14} /> Charger un exemple de test
        </button>
      </div>

      {/* Zone d'entrée JSON */}
      <div style={{ backgroundColor: darkMode ? '#1e293b' : 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '1.5rem', border: '1px solid rgba(0,0,0,0.08)' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Code de simulation reçu dans l'email du client (champ simulation_data) :
        </label>
        
        <textarea
          rows={4}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Collez ici le texte ou le JSON reçu (ex: { 'type': 'URBATEAM_DRAWING_SIMULATION', ... })"
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
            color: darkMode ? '#e2e8f0' : '#0f172a',
            resize: 'vertical'
          }}
        />

        {parseError && (
          <div style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '0.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={16} /> {parseError}
          </div>
        )}

        <div style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => handleParse()}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            🔮 Reconstruire le Schéma sur la Carte
          </button>
        </div>
      </div>

      {/* Rendu des données & Carte */}
      {parsedData && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* Fiche récapitulative */}
          <div style={{ backgroundColor: darkMode ? '#1e293b' : 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={18} /> Synthèse du Projet
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
              <div>
                <strong style={{ color: '#64748b' }}>Adresse :</strong>
                <div style={{ fontWeight: '700', marginTop: '0.1rem' }}>{parsedData.selectedAddress || 'Non spécifiée'}</div>
              </div>

              {parsedData.cadastreInfo && (
                <div style={{ backgroundColor: darkMode ? '#0f172a' : '#f1f5f9', padding: '0.65rem', borderRadius: '8px' }}>
                  <strong style={{ color: 'var(--primary-color)' }}>Références Cadastrales :</strong>
                  <div style={{ marginTop: '0.2rem' }}>
                    Commune : <strong>{parsedData.cadastreInfo.commune}</strong><br />
                    Section <strong>{parsedData.cadastreInfo.section}</strong> n°<strong>{parsedData.cadastreInfo.numero}</strong><br />
                    Surface fiscale : <strong>{parsedData.cadastreInfo.surface} m²</strong>
                  </div>
                </div>
              )}

              <div>
                <strong style={{ color: '#64748b' }}>Mode de dessin utilisé :</strong>
                <div style={{ fontWeight: '700', textTransform: 'capitalize', color: 'var(--primary-color)' }}>
                  {parsedData.drawMode === 'auto' && '📐 Glissières automatiques'}
                  {parsedData.drawMode === 'two_points' && '📍 Ligne 2 points sur-mesure'}
                  {parsedData.drawMode === 'polygon' && '✏️ Polygone libre sur-mesure'}
                </div>
              </div>

              {parsedData.drawMode === 'auto' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.4rem' }}>
                  <div style={{ backgroundColor: 'rgba(121, 160, 129, 0.15)', padding: '0.5rem', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--primary-color)' }}>LOT A</div>
                    <div style={{ fontSize: '1rem', fontWeight: '800' }}>{parsedData.surfaceLotA} m²</div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.15)', padding: '0.5rem', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#2563eb' }}>LOT B</div>
                    <div style={{ fontSize: '1rem', fontWeight: '800' }}>{parsedData.surfaceLotB} m²</div>
                  </div>
                </div>
              )}

              {parsedData.drawMode === 'two_points' && (
                <div style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '0.65rem', borderRadius: '8px', fontWeight: '700' }}>
                  📏 Longueur de la ligne : {parsedData.twoPointsDistance || (parsedData.twoPoints?.length === 2 ? calculateDistanceInMeters(parsedData.twoPoints[0], parsedData.twoPoints[1]) : 0)} m
                </div>
              )}

              {parsedData.drawMode === 'polygon' && (
                <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.65rem', borderRadius: '8px', fontWeight: '700' }}>
                  📐 Surface du polygone : {parsedData.polygonArea} m² ({parsedData.polygonPoints?.length || 0} sommets)
                </div>
              )}

              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                Créé le : {parsedData.timestamp ? new Date(parsedData.timestamp).toLocaleString('fr-FR') : 'Inconnu'}
              </div>
            </div>
          </div>

          {/* Carte Leaflet Reconstruite */}
          <div style={{ height: '520px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', position: 'relative' }}>
            
            {/* Sélecteur de couches */}
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
              borderRadius: '10px',
              border: '1px solid rgba(0,0,0,0.1)'
            }}>
              <button
                type="button"
                onClick={() => setMapMode('geoportail')}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: mapMode === 'geoportail' ? 'var(--primary-color)' : 'transparent',
                  color: mapMode === 'geoportail' ? 'white' : '#334155',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                🛰️ Géoportail
              </button>
              <button
                type="button"
                onClick={() => setMapMode('plan')}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: mapMode === 'plan' ? 'var(--primary-color)' : 'transparent',
                  color: mapMode === 'plan' ? 'white' : '#334155',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                🗺️ Plan
              </button>
            </div>

            <MapContainer
              center={parsedData.mapCenter || [48.3903, -4.4861]}
              zoom={parsedData.zoomLevel || 20}
              maxZoom={22}
              style={{ height: '100%', width: '100%' }}
              attributionControl={false}
            >
              <ChangeView center={parsedData.mapCenter} zoom={parsedData.zoomLevel || 20} />

              {/* Fonds de carte Géoportail / Plan */}
              {mapMode === 'geoportail' ? (
                <>
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    maxZoom={22}
                    maxNativeZoom={19}
                    opacity={0.88}
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
                </>
              ) : (
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

              {/* Rendu GeoJSON parcelle */}
              {cadastreGeoJson && (
                <GeoJSON
                  key={JSON.stringify(cadastreGeoJson)}
                  data={cadastreGeoJson}
                  style={{
                    color: 'var(--primary-color)',
                    weight: 3,
                    fillColor: 'var(--primary-color)',
                    fillOpacity: 0.25
                  }}
                />
              )}

              {/* Ligne automatique */}
              {parsedData.drawMode === 'auto' && autoLinePoints && (
                <Polyline
                  positions={autoLinePoints}
                  pathOptions={{
                    color: '#ef4444',
                    weight: 4,
                    dashArray: '8, 8'
                  }}
                />
              )}

              {/* Ligne 2 points */}
              {parsedData.drawMode === 'two_points' && parsedData.twoPoints && parsedData.twoPoints.length > 0 && (
                <>
                  {parsedData.twoPoints.map((pt, idx) => (
                    <Marker key={`v-pt-${idx}`} position={pt}>
                      <Popup>Point {idx + 1} de coupe du client</Popup>
                    </Marker>
                  ))}
                  {parsedData.twoPoints.length === 2 && (
                    <Polyline
                      positions={parsedData.twoPoints}
                      pathOptions={{
                        color: '#ef4444',
                        weight: 4,
                        dashArray: '6, 6'
                      }}
                    />
                  )}
                </>
              )}

              {/* Polygone */}
              {parsedData.drawMode === 'polygon' && parsedData.polygonPoints && parsedData.polygonPoints.length > 0 && (
                <>
                  {parsedData.polygonPoints.map((pt, idx) => (
                    <Marker key={`v-poly-${idx}`} position={pt}>
                      <Popup>Sommet {idx + 1} du polygone client</Popup>
                    </Marker>
                  ))}
                  {parsedData.polygonPoints.length >= 3 && (
                    <Polygon
                      positions={parsedData.polygonPoints}
                      pathOptions={{
                        color: '#10b981',
                        weight: 3,
                        fillColor: '#10b981',
                        fillOpacity: 0.35
                      }}
                    />
                  )}
                </>
              )}

              {/* Marqueur centre */}
              {parsedData.mapCenter && (
                <Marker position={parsedData.mapCenter}>
                  <Popup>
                    <strong>Emplacement du projet</strong><br />
                    {parsedData.selectedAddress}
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

        </div>
      )}

    </div>
  );
}
