import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    if (action === 'search') {
      const q = searchParams.get('q');
      if (!q) {
        return NextResponse.json({ features: [] });
      }
      
      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=5`, {
          headers: {
            'User-Agent': 'Urbateam-Agent/1.0',
          },
          signal: AbortSignal.timeout(5000)
        });
        
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      } catch (err) {
        console.warn('API Adresse search failed on server:', err.message);
      }
      return NextResponse.json({ features: [] });
    }

    if (action === 'reverse') {
      const lat = searchParams.get('lat');
      const lon = searchParams.get('lon');
      if (!lat || !lon) {
        return NextResponse.json({ features: [] });
      }

      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${lon}&lat=${lat}`, {
          headers: {
            'User-Agent': 'Urbateam-Agent/1.0',
          },
          signal: AbortSignal.timeout(5000)
        });

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      } catch (err) {
        console.warn('API Adresse reverse failed on server:', err.message);
      }
      return NextResponse.json({ features: [] });
    }

    if (action === 'parcel') {
      const lat = searchParams.get('lat');
      const lon = searchParams.get('lon');
      if (!lat || !lon) {
        return NextResponse.json({ features: [] });
      }

      try {
        const geom = JSON.stringify({ type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] });
        const res = await fetch(`https://apicarto.ign.fr/api/cadastre/parcelle?geom=${encodeURIComponent(geom)}`, {
          headers: {
            'User-Agent': 'Urbateam-Agent/1.0',
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(5000)
        });

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      } catch (err) {
        console.warn('API Cadastre IGN failed on server:', err.message);
      }
      return NextResponse.json({ features: [] });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Cadastre proxy error:', error);
    return NextResponse.json({ features: [] });
  }
}
