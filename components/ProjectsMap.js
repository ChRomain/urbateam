'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Importation dynamique car Leaflet utilise 'window' (non dispo au SSR)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const MarkerClusterGroup = dynamic(() => import('react-leaflet-cluster'), { ssr: false });

export default function ProjectsMap({ projects = [] }) {
  const [L, setL] = useState(null);

  useEffect(() => {
    // Charger Leaflet côté client
    import('leaflet').then(leaf => {
      // Fix pour les icônes par défaut qui ne s'affichent pas dans Next.js
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

  // Filtrer les projets qui ont des coordonnées
  const mapProjects = projects.filter(p => p.latitude && p.longitude);

  // Centre par défaut (Brest)
  const center = [48.3903, -4.4861];

  return (
    <div style={{ height: '500px', width: '100%', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '8px solid white', position: 'relative', zIndex: 1 }}>
      <MapContainer center={center} zoom={9} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup chunkedLoading>
          {mapProjects.map((project) => (
            <Marker key={project.id} position={[project.latitude, project.longitude]}>
              <Popup>
                <div style={{ padding: '5px' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: 'var(--secondary-color)' }}>{project.title}</h4>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px' }}>{project.location}</p>
                  <a 
                    href={`/projets/${project.slug || project.id}`} 
                    style={{ 
                      fontSize: '11px', 
                      color: 'var(--primary-color)', 
                      fontWeight: '700', 
                      textDecoration: 'none',
                      textTransform: 'uppercase'
                    }}
                  >
                    Voir le projet
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
