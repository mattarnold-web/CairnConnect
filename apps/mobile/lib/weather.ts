/**
 * Real-time weather service using Open-Meteo (free, no API key needed).
 * Used on trail detail pages and trip planner.
 */

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

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
  66: { label: 'Freezing rain', icon: '🌨️' },
  67: { label: 'Freezing rain', icon: '🌨️' },
  71: { label: 'Slight snow', icon: '🌨️' },
  73: { label: 'Moderate snow', icon: '❄️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  80: { label: 'Rain showers', icon: '🌦️' },
  81: { label: 'Moderate showers', icon: '🌧️' },
  82: { label: 'Heavy showers', icon: '⛈️' },
  85: { label: 'Snow showers', icon: '🌨️' },
  86: { label: 'Heavy snow showers', icon: '❄️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm with hail', icon: '⛈️' },
  99: { label: 'Severe thunderstorm', icon: '⛈️' },
};

function decodeWMO(code: number) {
  return WMO_CODES[code] ?? { label: 'Unknown', icon: '❓' };
}

function cToF(c: number) {
  return Math.round(c * 9 / 5 + 32);
}

export interface CurrentWeather {
  temp_c: number;
  temp_f: number;
  feels_like_c: number;
  feels_like_f: number;
  humidity: number;
  wind_speed_kmh: number;
  uv_index: number;
  conditions: string;
  icon: string;
}

export interface DailyForecast {
  date: string;
  conditions: string;
  icon: string;
  high_c: number;
  high_f: number;
  low_c: number;
  low_f: number;
  precip_mm: number;
  precip_chance: number;
  wind_max_kmh: number;
  uv_max: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherData {
  current: CurrentWeather;
  daily: DailyForecast[];
  elevation_m: number | null;
}

// In-memory cache (TTL: 30 min)
const cache = new Map<string, { data: WeatherData; ts: number }>();
const CACHE_TTL = 30 * 60 * 1000;

export async function fetchWeather(lat: number, lng: number): Promise<WeatherData> {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max,sunrise,sunset',
    timezone: 'auto',
    forecast_days: '7',
  });

  const res = await fetch(`${OPEN_METEO_URL}?${params}`);
  if (!res.ok) throw new Error(`Weather API ${res.status}`);

  const d = await res.json();
  const cur = d.current;
  const wmo = decodeWMO(cur.weather_code);

  const data: WeatherData = {
    current: {
      temp_c: Math.round(cur.temperature_2m),
      temp_f: cToF(cur.temperature_2m),
      feels_like_c: Math.round(cur.apparent_temperature),
      feels_like_f: cToF(cur.apparent_temperature),
      humidity: cur.relative_humidity_2m,
      wind_speed_kmh: Math.round(cur.wind_speed_10m),
      uv_index: cur.uv_index,
      conditions: wmo.label,
      icon: wmo.icon,
    },
    daily: (d.daily?.time ?? []).map((t: string, i: number) => ({
      date: t,
      conditions: decodeWMO(d.daily.weather_code[i]).label,
      icon: decodeWMO(d.daily.weather_code[i]).icon,
      high_c: Math.round(d.daily.temperature_2m_max[i]),
      high_f: cToF(d.daily.temperature_2m_max[i]),
      low_c: Math.round(d.daily.temperature_2m_min[i]),
      low_f: cToF(d.daily.temperature_2m_min[i]),
      precip_mm: d.daily.precipitation_sum[i],
      precip_chance: d.daily.precipitation_probability_max[i],
      wind_max_kmh: Math.round(d.daily.wind_speed_10m_max[i]),
      uv_max: d.daily.uv_index_max[i],
      sunrise: d.daily.sunrise[i],
      sunset: d.daily.sunset[i],
    })),
    elevation_m: d.elevation ?? null,
  };

  cache.set(key, { data, ts: Date.now() });
  return data;
}

