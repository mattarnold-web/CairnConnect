import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/weather?lat=38.57&lng=-109.55
 *
 * Returns current weather + 7-day forecast for a given coordinate using the
 * free Open-Meteo API. Designed for trail detail pages and trip planning.
 *
 * Response shape:
 * {
 *   current: { temp_c, temp_f, feels_like_c, humidity, wind_speed_kmh, wind_direction, uv_index, conditions, icon },
 *   hourly: [...next 24h],
 *   daily: [...next 7 days],
 *   elevation_m: number,
 * }
 */

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

// Map WMO weather codes to human-readable conditions and icons
const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mainly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Fog', icon: '🌫️' },
  48: { label: 'Rime fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Moderate drizzle', icon: '🌦️' },
  55: { label: 'Dense drizzle', icon: '🌧️' },
  61: { label: 'Slight rain', icon: '🌧️' },
  63: { label: 'Moderate rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  66: { label: 'Freezing rain (light)', icon: '🌨️' },
  67: { label: 'Freezing rain (heavy)', icon: '🌨️' },
  71: { label: 'Slight snow', icon: '🌨️' },
  73: { label: 'Moderate snow', icon: '❄️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  77: { label: 'Snow grains', icon: '❄️' },
  80: { label: 'Rain showers (slight)', icon: '🌦️' },
  81: { label: 'Rain showers (moderate)', icon: '🌧️' },
  82: { label: 'Rain showers (violent)', icon: '⛈️' },
  85: { label: 'Snow showers (slight)', icon: '🌨️' },
  86: { label: 'Snow showers (heavy)', icon: '❄️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm with hail', icon: '⛈️' },
  99: { label: 'Thunderstorm with heavy hail', icon: '⛈️' },
};

function decodeWMO(code: number) {
  return WMO_CODES[code] ?? { label: 'Unknown', icon: '❓' };
}

function cToF(c: number) {
  return Math.round(c * 9 / 5 + 32);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') ?? '');
  const lng = parseFloat(searchParams.get('lng') ?? '');

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat and lng query params required' }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index',
      hourly: 'temperature_2m,weather_code,precipitation_probability,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max,sunrise,sunset',
      timezone: 'auto',
      forecast_days: '7',
      forecast_hours: '24',
    });

    const res = await fetch(`${OPEN_METEO_URL}?${params}`, {
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!res.ok) {
      throw new Error(`Open-Meteo returned ${res.status}`);
    }

    const data = await res.json();
    const cur = data.current;
    const wmo = decodeWMO(cur.weather_code);

    const response = {
      current: {
        temp_c: Math.round(cur.temperature_2m),
        temp_f: cToF(cur.temperature_2m),
        feels_like_c: Math.round(cur.apparent_temperature),
        feels_like_f: cToF(cur.apparent_temperature),
        humidity: cur.relative_humidity_2m,
        wind_speed_kmh: Math.round(cur.wind_speed_10m),
        wind_direction: cur.wind_direction_10m,
        uv_index: cur.uv_index,
        conditions: wmo.label,
        icon: wmo.icon,
      },
      hourly: (data.hourly?.time ?? []).slice(0, 24).map((t: string, i: number) => ({
        time: t,
        temp_c: Math.round(data.hourly.temperature_2m[i]),
        temp_f: cToF(data.hourly.temperature_2m[i]),
        conditions: decodeWMO(data.hourly.weather_code[i]).label,
        icon: decodeWMO(data.hourly.weather_code[i]).icon,
        precip_chance: data.hourly.precipitation_probability[i],
        wind_speed_kmh: Math.round(data.hourly.wind_speed_10m[i]),
      })),
      daily: (data.daily?.time ?? []).map((t: string, i: number) => ({
        date: t,
        conditions: decodeWMO(data.daily.weather_code[i]).label,
        icon: decodeWMO(data.daily.weather_code[i]).icon,
        high_c: Math.round(data.daily.temperature_2m_max[i]),
        high_f: cToF(data.daily.temperature_2m_max[i]),
        low_c: Math.round(data.daily.temperature_2m_min[i]),
        low_f: cToF(data.daily.temperature_2m_min[i]),
        precip_mm: data.daily.precipitation_sum[i],
        precip_chance: data.daily.precipitation_probability_max[i],
        wind_max_kmh: Math.round(data.daily.wind_speed_10m_max[i]),
        uv_max: data.daily.uv_index_max[i],
        sunrise: data.daily.sunrise[i],
        sunset: data.daily.sunset[i],
      })),
      elevation_m: data.elevation ?? null,
    };

    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' },
    });
  } catch (err: any) {
    console.error('Weather API error:', err.message);
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 502 });
  }
}

