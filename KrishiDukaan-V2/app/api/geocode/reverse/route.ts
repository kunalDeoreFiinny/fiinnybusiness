import { NextRequest, NextResponse } from 'next/server';

type GeocodeResult = { formatted_address?: string; types?: string[] };

function pickFormattedAddress(results: GeocodeResult[]): string | null {
  if (!Array.isArray(results) || !results.length) return null;

  const preferTypes = [
    'street_address',
    'premise',
    'subpremise',
    'route',
    'neighborhood',
    'sublocality',
    'sublocality_level_1',
    'locality',
    'administrative_area_level_3',
  ];

  for (const r of results) {
    const fa = r.formatted_address;
    if (typeof fa !== 'string' || !fa.trim()) continue;
    const types = r.types || [];
    if (types.some((t) => preferTypes.includes(t))) return fa.trim();
  }

  const first = results[0]?.formatted_address;
  return typeof first === 'string' && first.trim() ? first.trim() : null;
}

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('lat');
  const lng = req.nextUrl.searchParams.get('lng');
  if (lat == null || lng == null || lat === '' || lng === '') {
    return NextResponse.json({ error: 'missing lat or lng' }, { status: 400 });
  }

  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
    return NextResponse.json({ error: 'invalid coordinates' }, { status: 400 });
  }

  const key =
    process.env.GOOGLE_MAPS_SERVER_KEY?.trim() ||
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

  if (!key) {
    return NextResponse.json({ formatted_address: null, geocode_status: 'NO_API_KEY' });
  }

  let data: { status?: string; error_message?: string; results?: GeocodeResult[] };
  try {
    const upstream = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latNum},${lngNum}&key=${encodeURIComponent(key)}`
    );
    data = await upstream.json();
  } catch {
    return NextResponse.json({ formatted_address: null, geocode_status: 'FETCH_FAILED' });
  }

  if (data.status === 'OK' && data.results?.length) {
    const formatted = pickFormattedAddress(data.results);
    if (formatted) {
      return NextResponse.json({ formatted_address: formatted, geocode_status: 'OK' });
    }
  }

  return NextResponse.json({
    formatted_address: null,
    geocode_status: data.status || 'UNKNOWN',
    geocode_error: data.error_message || null,
  });
}
