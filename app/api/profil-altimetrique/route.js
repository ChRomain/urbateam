import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat1 = searchParams.get('lat1');
  const lon1 = searchParams.get('lon1');
  const lat2 = searchParams.get('lat2');
  const lon2 = searchParams.get('lon2');
  const samplingParam = searchParams.get('sampling') || '50';

  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return NextResponse.json(
      { error: 'Paramètres manquants. Veuillez spécifier lat1, lon1, lat2 et lon2.' },
      { status: 400 }
    );
  }

  const sampling = Math.min(Math.max(parseInt(samplingParam, 10) || 10, 2), 500);

  try {
    // Formatage des paramètres pour l'API IGN Géoplateforme
    // L'API attend les coordonnées séparées par un séparateur (par défaut '|')
    const lonList = `${lon1}|${lon2}`;
    const latList = `${lat1}|${lat2}`;

    const ignUrl = `https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevationLine.json?lon=${encodeURIComponent(
      lonList
    )}&lat=${encodeURIComponent(latList)}&sampling=${sampling}&resource=ign_rge_alti_wld`;

    const res = await fetch(ignUrl, {
      headers: {
        'User-Agent': 'Urbateam-Agent/1.0',
        'Accept': 'application/json',
      },
      // Timeout de 5 secondes pour éviter de bloquer la fonction Vercel/Cloudflare
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.error(`Erreur de l'API IGN Alti: HTTP ${res.status}`);
      return NextResponse.json(
        { error: `L'API Géoportail a renvoyé une erreur (Code HTTP ${res.status}).` },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Erreur dans le proxy altimétrique :', err);
    return NextResponse.json(
      { error: 'Impossible de contacter le service altimétrique de l\'IGN.' },
      { status: 500 }
    );
  }
}
