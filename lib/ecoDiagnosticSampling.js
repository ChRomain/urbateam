/** Génération de points d'échantillonnage autour d'une parcelle (sans inventer de données). */

const METERS_TO_DEG_LAT = 1 / 111320;

export function offsetMeters(lat, lon, eastM, northM) {
  const dLat = northM * METERS_TO_DEG_LAT;
  const dLon = eastM / (111320 * Math.cos((lat * Math.PI) / 180));
  return [lat + dLat, lon + dLon];
}

function getExteriorRing(geometry) {
  if (!geometry?.coordinates) return [];
  const { type, coordinates } = geometry;
  if (type === 'Polygon') return coordinates[0] || [];
  if (type === 'MultiPolygon') return coordinates[0]?.[0] || [];
  return [];
}

/**
 * Points à tester : centroïde, anneau ~25 m / ~50 m, sommets parcelle (échantillonnés).
 * @returns {{ lat: number, lon: number, source: string }[]}
 */
export function getSamplePoints(centerLat, centerLon, geometry, maxPoints = 17) {
  const points = [];
  const seen = new Set();
  const add = (lat, lon, source) => {
    const k = `${lat.toFixed(6)},${lon.toFixed(6)}`;
    if (seen.has(k)) return;
    seen.add(k);
    points.push({ lat, lon, source });
  };

  add(centerLat, centerLon, 'centroid');

  for (const dist of [25, 50]) {
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const east = Math.sin(angle) * dist;
      const north = Math.cos(angle) * dist;
      const [lat, lon] = offsetMeters(centerLat, centerLon, east, north);
      add(lat, lon, `ring_${dist}m`);
    }
  }

  const ring = getExteriorRing(geometry);
  if (ring.length > 0) {
    const step = Math.max(1, Math.floor(ring.length / 6));
    ring.forEach(([lon, lat], i) => {
      if (i % step === 0) add(lat, lon, 'parcel_vertex');
    });
  }

  return points.slice(0, maxPoints);
}

/** Polygone circulaire approximatif (buffer) pour APIs IGN. */
export function buildBufferPolygon(lat, lon, radiusM = 50, segments = 12) {
  const ring = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i * Math.PI * 2) / segments;
    const east = Math.sin(angle) * radiusM;
    const north = Math.cos(angle) * radiusM;
    const [pLat, pLon] = offsetMeters(lat, lon, east, north);
    ring.push([pLon, pLat]);
  }
  return { type: 'Polygon', coordinates: [ring] };
}
