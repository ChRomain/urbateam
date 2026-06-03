import { NextResponse } from 'next/server';
import { fetchEcoDiagnosticBundle } from '../../../lib/ecoDiagnosticFetch';

export const maxDuration = 60;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat'));
  const lon = parseFloat(searchParams.get('lon'));
  const geomParam = searchParams.get('geom');

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return NextResponse.json({ error: 'lat et lon requis' }, { status: 400 });
  }

  let parcelGeometry = null;
  if (geomParam) {
    try {
      parcelGeometry = JSON.parse(geomParam);
    } catch {
      return NextResponse.json({ error: 'geom JSON invalide' }, { status: 400 });
    }
  }

  try {
    const ecoData = await fetchEcoDiagnosticBundle(lat, lon, parcelGeometry);
    return NextResponse.json(ecoData);
  } catch (err) {
    console.error('eco-diagnostic bundle error:', err);
    return NextResponse.json(
      {
        unavailableServices: ['Services publics (Géorisques, IGN, Culture)'],
        fetchError: true,
        clayUnavailable: true,
        georisquesUnavailable: true,
        monumentsUnavailable: true,
        pluUnavailable: true,
        naturaUnavailable: true,
        altiUnavailable: true,
      },
      { status: 503 }
    );
  }
}
