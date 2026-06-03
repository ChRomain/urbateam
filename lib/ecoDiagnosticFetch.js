import { getSamplePoints, buildBufferPolygon } from './ecoDiagnosticSampling';

const UA = { 'User-Agent': 'Urbateam-Agent/1.0', Accept: 'application/json' };
const TIMEOUT_MS = 12000;
const RETRIES = 2;

async function fetchUpstream(url) {
  let lastErr;
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        headers: UA,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      return res;
    } catch (err) {
      lastErr = err;
      if (attempt < RETRIES - 1) await new Promise((r) => setTimeout(r, 400));
    }
  }
  throw lastErr;
}

function georisquesLabel(riskObj) {
  if (!riskObj) return null;
  const label = riskObj.libelleStatutAdresse;
  return typeof label === 'string' && label.trim() ? label.trim() : null;
}

function hasGeorisquesData(json) {
  const rn = json?.risquesNaturels;
  if (!rn) return false;
  return Boolean(
    georisquesLabel(rn.inondation) ||
      georisquesLabel(rn.remonteeNappe) ||
      georisquesLabel(rn.seisme) ||
      georisquesLabel(rn.radon)
  );
}

function parseNaturaFeatures(habitats, oiseaux) {
  const sites = [];
  (habitats || []).forEach((h) => {
    if (h.properties?.sitename) sites.push(`${h.properties.sitename} (Directive Habitats)`);
  });
  (oiseaux || []).forEach((o) => {
    if (o.properties?.sitename) sites.push(`${o.properties.sitename} (Directive Oiseaux)`);
  });
  return [...new Set(sites)];
}

async function fetchArgilesAt(lat, lon) {
  const url = `https://www.georisques.gouv.fr/api/v1/retrait_gonflement_argiles?lat=${lat}&lng=${lon}&limit=1`;
  const res = await fetchUpstream(url);
  if (!res.ok) return { ok: false };
  const json = await res.json();
  return { ok: true, json };
}

async function fetchGeorisquesAt(lat, lon) {
  const url = `https://www.georisques.gouv.fr/api/v1/resultats_rapport_risque?latlon=${lon},${lat}`;
  const res = await fetchUpstream(url);
  if (!res.ok) return { ok: false };
  const json = await res.json();
  return { ok: true, json };
}

async function fetchMonumentsAt(lat, lon) {
  const url = `https://data.culture.gouv.fr/api/records/1.0/search/?dataset=liste-des-immeubles-proteges-au-titre-des-monuments-historiques&geofilter.distance=${lat},${lon},1000&rows=1`;
  const res = await fetchUpstream(url);
  if (!res.ok) return { ok: false };
  const json = await res.json();
  return { ok: true, json };
}

async function fetchAltiAt(lat, lon) {
  const url = `https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json?lon=${lon}&lat=${lat}&resource=ign_rge_alti_wld`;
  const res = await fetchUpstream(url);
  if (!res.ok) return { ok: false };
  const json = await res.json();
  return { ok: true, json };
}

async function fetchPluWithGeom(geom) {
  const geomStr = encodeURIComponent(JSON.stringify(geom));
  const url = `https://apicarto.ign.fr/api/gpu/zone-urba?geom=${geomStr}`;
  const res = await fetchUpstream(url);
  if (!res.ok) return { ok: false };
  const json = await res.json();
  return { ok: true, json };
}

async function fetchNaturaWithGeom(geom) {
  const geomStr = encodeURIComponent(JSON.stringify(geom));
  const [habitatsRes, oiseauxRes] = await Promise.all([
    fetchUpstream(`https://apicarto.ign.fr/api/nature/natura-habitat?geom=${geomStr}`),
    fetchUpstream(`https://apicarto.ign.fr/api/nature/natura-oiseaux?geom=${geomStr}`),
  ]);
  if (!habitatsRes.ok || !oiseauxRes.ok) return { ok: false };
  const habitats = ((await habitatsRes.json()).features) || [];
  const oiseaux = ((await oiseauxRes.json()).features) || [];
  return { ok: true, json: { habitats, oiseaux } };
}

async function tryPointsBatched(fetchAt, points, hasData, batchSize = 4) {
  let anyOk = false;
  for (let i = 0; i < points.length; i += batchSize) {
    const chunk = points.slice(i, i + batchSize);
    const settled = await Promise.allSettled(
      chunk.map(async (p) => {
        const result = await fetchAt(p.lat, p.lon);
        return { ...result, source: p.source };
      })
    );
    for (const att of settled) {
      if (att.status !== 'fulfilled') continue;
      const { ok, json, source } = att.value;
      if (ok) {
        anyOk = true;
        if (hasData(json)) return { unavailable: false, json, source };
      }
    }
  }
  if (anyOk) return { unavailable: false, json: {}, exhausted: true };
  return { unavailable: true };
}

/**
 * Agrège toutes les sources pour une parcelle.
 * @param {number} centerLat
 * @param {number} centerLon
 * @param {object|null} parcelGeometry GeoJSON geometry
 */
export async function fetchEcoDiagnosticBundle(centerLat, centerLon, parcelGeometry) {
  const points = getSamplePoints(centerLat, centerLon, parcelGeometry);
  const buffer50 = buildBufferPolygon(centerLat, centerLon, 50);

  const unavailableServices = [];
  const data = {
    unavailableServices,
    clayClasse: null,
    clayUnavailable: false,
    clayNoData: false,
    claySource: null,
    seisme: null,
    radon: null,
    inundation: null,
    nappe: null,
    georisquesUnavailable: false,
    georisquesSource: null,
    monumentDist: null,
    monumentName: null,
    monumentsUnavailable: false,
    monumentsNoneInRadius: false,
    monumentsSource: null,
    pluZone: null,
    pluDesc: null,
    pluUnavailable: false,
    pluNoZoneAtPoint: false,
    pluSource: null,
    naturaSites: null,
    naturaUnavailable: false,
    naturaNoneAtPoint: false,
    naturaSource: null,
    altitude: null,
    altiUnavailable: false,
    altiSource: null,
  };

  // Argiles
  const argilesResult = await tryPointsBatched(
    fetchArgilesAt,
    points,
    (json) => json.data?.length > 0
  );
  if (argilesResult.unavailable) {
    data.clayUnavailable = true;
    unavailableServices.push('Géorisques — retrait-gonflement des argiles');
  } else if (argilesResult.json?.data?.length > 0) {
    data.clayClasse = argilesResult.json.data[0].classe_exposition_argile || null;
    data.claySource = argilesResult.source;
  } else {
    data.clayNoData = true;
  }

  // Géorisques risques
  const georisquesResult = await tryPointsBatched(fetchGeorisquesAt, points, hasGeorisquesData);
  if (georisquesResult.unavailable) {
    data.georisquesUnavailable = true;
    unavailableServices.push('Géorisques — risques naturels');
  } else if (hasGeorisquesData(georisquesResult.json)) {
    const rn = georisquesResult.json.risquesNaturels;
    data.inundation = georisquesLabel(rn.inondation);
    data.nappe = georisquesLabel(rn.remonteeNappe);
    data.seisme = georisquesLabel(rn.seisme);
    data.radon = georisquesLabel(rn.radon);
    data.georisquesSource = georisquesResult.source;
  } else {
    data.georisquesUnavailable = false;
    data.georisquesNoData = true;
  }

  // Monuments (rayon 1 km — centroïde suffit en général)
  try {
    const mon = await fetchMonumentsAt(centerLat, centerLon);
    if (mon.ok) {
      if (mon.json.records?.length > 0) {
        const record = mon.json.records[0];
        const dist = record.fields?.dist;
        if (typeof dist === 'number' && !Number.isNaN(dist)) data.monumentDist = Math.round(dist);
        data.monumentName = record.fields?.titre_editorial_de_la_notice || null;
        data.monumentsSource = 'centroid';
      } else {
        data.monumentsNoneInRadius = true;
      }
    } else {
      const monFallback = await tryPointsBatched(
        fetchMonumentsAt,
        points.slice(1, 5),
        (json) => json.records?.length > 0,
        4
      );
      if (monFallback.unavailable) {
        data.monumentsUnavailable = true;
        unavailableServices.push('Ministère de la Culture — monuments historiques');
      } else if (monFallback.json?.records?.length > 0) {
        const record = monFallback.json.records[0];
        const dist = record.fields?.dist;
        if (typeof dist === 'number' && !Number.isNaN(dist)) data.monumentDist = Math.round(dist);
        data.monumentName = record.fields?.titre_editorial_de_la_notice || null;
        data.monumentsSource = monFallback.source;
      } else {
        data.monumentsNoneInRadius = true;
      }
    }
  } catch {
    data.monumentsUnavailable = true;
    unavailableServices.push('Ministère de la Culture — monuments historiques');
  }

  // Altimétrie
  const altiResult = await tryPointsBatched(
    fetchAltiAt,
    points,
    (json) => json.elevations?.length > 0 && typeof json.elevations[0].z === 'number'
  );
  if (altiResult.unavailable) {
    data.altiUnavailable = true;
    unavailableServices.push('IGN — altimétrie');
  } else if (altiResult.json?.elevations?.[0]?.z != null) {
    data.altitude = Math.round(altiResult.json.elevations[0].z * 10) / 10;
    data.altiSource = altiResult.source;
  }

  // PLU : lots de points puis buffer 50 m
  let pluFound = false;
  let pluAnyOk = false;
  const applyPluFeature = (f, source) => {
    const props = f.properties || {};
    if (props.libelle) data.pluZone = String(props.libelle);
    else if (props.typezone) data.pluZone = `Zone ${props.typezone}`;
    if (props.libelong) data.pluDesc = String(props.libelong);
    data.pluSource = source;
    pluFound = true;
  };
  for (let i = 0; i < points.length && !pluFound; i += 4) {
    const chunk = points.slice(i, i + 4);
    const settled = await Promise.allSettled(
      chunk.map(async (p) => {
        const plu = await fetchPluWithGeom({ type: 'Point', coordinates: [p.lon, p.lat] });
        return { plu, source: p.source };
      })
    );
    for (const att of settled) {
      if (att.status !== 'fulfilled') continue;
      if (att.value.plu.ok) {
        pluAnyOk = true;
        const features = att.value.plu.json.features;
        if (features?.length > 0) {
          applyPluFeature(features[0], att.value.source);
          break;
        }
      }
    }
  }
  if (!pluFound) {
    try {
      const plu = await fetchPluWithGeom(buffer50);
      if (plu.ok) {
        pluAnyOk = true;
        if (plu.json.features?.length > 0) {
          applyPluFeature(plu.json.features[0], 'buffer_50m');
        }
      }
    } catch {
      /* ignore */
    }
  }
  if (!pluFound) {
    if (!pluAnyOk) {
      data.pluUnavailable = true;
      unavailableServices.push("Géoportail de l'urbanisme — zonage PLU");
    } else {
      data.pluNoZoneAtPoint = true;
    }
  }

  // Natura 2000 : lots de points puis buffer
  let naturaSites = null;
  let naturaSource = null;
  let naturaAnyOk = false;
  for (let i = 0; i < points.length && !naturaSites; i += 4) {
    const chunk = points.slice(i, i + 4);
    const settled = await Promise.allSettled(
      chunk.map(async (p) => {
        const nat = await fetchNaturaWithGeom({ type: 'Point', coordinates: [p.lon, p.lat] });
        return { nat, source: p.source };
      })
    );
    for (const att of settled) {
      if (att.status !== 'fulfilled') continue;
      if (att.value.nat.ok) {
        naturaAnyOk = true;
        const sites = parseNaturaFeatures(att.value.nat.json.habitats, att.value.nat.json.oiseaux);
        if (sites.length > 0) {
          naturaSites = sites;
          naturaSource = att.value.source;
          break;
        }
      }
    }
  }
  if (!naturaSites) {
    try {
      const nat = await fetchNaturaWithGeom(buffer50);
      if (nat.ok) {
        naturaAnyOk = true;
        const sites = parseNaturaFeatures(nat.json.habitats, nat.json.oiseaux);
        if (sites.length > 0) {
          naturaSites = sites;
          naturaSource = 'buffer_50m';
        }
      }
    } catch {
      /* ignore */
    }
  }
  if (naturaSites?.length) {
    data.naturaSites = naturaSites;
    data.naturaSource = naturaSource;
  } else if (!naturaAnyOk) {
    data.naturaUnavailable = true;
    unavailableServices.push('IGN — Natura 2000');
  } else {
    data.naturaNoneAtPoint = true;
  }

  data.unavailableServices = [...new Set(unavailableServices)];
  return data;
}
