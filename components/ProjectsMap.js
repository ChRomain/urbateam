'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Importation dynamique car Leaflet utilise 'window' (non dispo au SSR)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const MarkerClusterGroup = dynamic(() => import('react-leaflet-cluster'), { ssr: false });

function ProjectMarker({ project, index, createRedPinIcon, leafletMap }) {
  const markerRef = useRef(null);
  const timerRef = useRef(null);
  const [popupOffset, setPopupOffset] = useState([0, -20]);
  const [isTopPin, setIsTopPin] = useState(false);

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (markerRef.current) {
      if (leafletMap) {
        try {
          const latLng = markerRef.current.getLatLng();
          const point = leafletMap.latLngToContainerPoint(latLng);
          // Si le pin est proche du bord supérieur (< 140px de la limite haute)
          if (point && point.y < 140) {
            setPopupOffset([0, 45]); // Affiche l'infobulle SOUS le pin
            setIsTopPin(true);
          } else {
            setPopupOffset([0, -20]); // Affiche l'infobulle AU-DESSUS du pin
            setIsTopPin(false);
          }
        } catch (e) {}
      }

      if (!markerRef.current.isPopupOpen()) {
        markerRef.current.openPopup();
      }
    }
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (markerRef.current && markerRef.current.isPopupOpen()) {
        markerRef.current.closePopup();
      }
    }, 250);
  };

  return (
    <Marker 
      ref={markerRef}
      position={[project.latitude, project.longitude]} 
      icon={createRedPinIcon(index)}
      eventHandlers={{
        mouseover: handleMouseEnter,
        mouseout: handleMouseLeave,
        click: () => {
          window.location.href = `/projets/${project.slug || project.id}`;
        }
      }}
    >
      <Popup 
        closeButton={false} 
        autoPan={true}
        autoPanPadding={[40, 40]}
        offset={popupOffset}
        className={isTopPin ? 'top-pin-popup' : 'normal-pin-popup'}
      >
        <div 
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ textAlign: 'center', minWidth: '160px' }}
        >
          <h4 style={{ margin: '0 0 4px 0', color: 'var(--secondary-color)', fontSize: '14px', fontWeight: '700' }}>{project.title}</h4>
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b' }}>📍 {project.location}</p>
          <a 
            href={`/projets/${project.slug || project.id}`} 
            style={{ 
              fontSize: '11px', 
              color: 'var(--primary-color)', 
              fontWeight: '700', 
              textDecoration: 'none',
              textTransform: 'uppercase',
              display: 'inline-block'
            }}
          >
            Voir le projet →
          </a>
        </div>
      </Popup>
    </Marker>
  );
}

export default function ProjectsMap({ projects = [] }) {
  const [L, setL] = useState(null);
  const [leafletMap, setLeafletMap] = useState(null);

  useEffect(() => {
    // Charger Leaflet côté client
    import('leaflet').then(leaf => {
      delete leaf.Icon.Default.prototype._getIconUrl;
      leaf.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
      setL(leaf);
    });
  }, []);

  if (!L) return <div style={{ height: '400px', backgroundColor: '#f1f5f9', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Chargement de la carte...</div>;

  const mapProjects = projects.filter(p => p.latitude && p.longitude);
  const center = [48.15, -3.10];

  const createRedPinIcon = (index) => {
    const delay = (index % 12) * 0.07;
    const emojiHtml = `
      <div class="emoji-pin-wrapper" style="animation-delay: ${delay}s;">
        <span class="emoji-pin-icon">📍</span>
      </div>
    `;

    return L.divIcon({
      html: emojiHtml,
      className: 'custom-leaflet-emoji-pin',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  return (
    <div style={{ height: '500px', width: '100%', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '8px solid white', position: 'relative', zIndex: 1 }}>
      <style>{`
        .custom-leaflet-emoji-pin {
          background: transparent !important;
          border: none !important;
        }
        .emoji-pin-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          opacity: 0;
          animation: pinDrop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: bottom center;
          cursor: pointer;
        }
        .emoji-pin-icon {
          font-size: 32px;
          line-height: 1;
          display: inline-block;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.25s ease;
        }
        .emoji-pin-wrapper:hover .emoji-pin-icon {
          transform: scale(1.3) translateY(-4px);
          filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.4));
        }
        .leaflet-popup-content-wrapper {
          background: white !important;
          border-radius: 14px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
          padding: 4px !important;
          position: relative !important;
        }
        .top-pin-popup .leaflet-popup-tip-container {
          top: -20px !important;
          bottom: auto !important;
          transform: rotate(180deg) !important;
        }
        .top-pin-popup .leaflet-popup-content-wrapper::after {
          top: -20px !important;
          bottom: auto !important;
        }
        .leaflet-popup-content-wrapper::after {
          content: '';
          position: absolute;
          bottom: -20px;
          left: -20px;
          right: -20px;
          height: 35px;
          background: transparent;
        }
        .leaflet-popup-content {
          margin: 10px 14px !important;
          line-height: 1.4 !important;
        }
        .leaflet-popup-tip {
          background: white !important;
        }
        @keyframes pinDrop {
          0% {
            opacity: 0;
            transform: translateY(-40px) scale(0.2);
          }
          65% {
            opacity: 1;
            transform: translateY(4px) scale(1.2);
          }
          85% {
            transform: translateY(-2px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
      <MapContainer 
        ref={setLeafletMap} 
        center={center} 
        zoom={8} 
        style={{ height: '100%', width: '100%' }} 
        scrollWheelZoom={false} 
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup chunkedLoading>
          {mapProjects.map((project, index) => (
            <ProjectMarker 
              key={project.id} 
              project={project} 
              index={index} 
              createRedPinIcon={createRedPinIcon} 
              leafletMap={leafletMap}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
