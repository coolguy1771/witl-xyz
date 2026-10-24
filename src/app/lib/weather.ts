import { cachedJson } from "./edge-cache";

export type Weather = { temp: number; condition: string; humidity: number };

// WMO weather interpretation codes -> short label
function describe(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 2) return "Partly Cloudy";
  if (code === 3) return "Cloudy";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 67) return "Rainy";
  if (code >= 71 && code <= 77) return "Snowy";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 85 && code <= 86) return "Snow Showers";
  if (code >= 95) return "Thunderstorm";
  return "Unknown";
}

/**
 * Current weather from Open-Meteo (no API key). Coordinates are rounded to one
 * decimal (~10km), which also makes the edge cache hit across nearby visitors.
 */
export async function getWeather(latitude: number, longitude: number): Promise<Weather | null> {
  const lat = latitude.toFixed(1);
  const lon = longitude.toFixed(1);

  try {
    return await cachedJson(
      `weather:${lat}:${lon}`,
      600,
      async () => {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          "&current=temperature_2m,relative_humidity_2m,weather_code";
        const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
        if (!res.ok) return null;

        const { current } = (await res.json()) as {
          current?: {
            temperature_2m: number;
            relative_humidity_2m: number;
            weather_code: number;
          };
        };
        if (!current) return null;

        return {
          temp: Math.round(current.temperature_2m),
          condition: describe(current.weather_code),
          humidity: Math.round(current.relative_humidity_2m),
        };
      },
      (weather) => weather !== null
    );
  } catch {
    return null;
  }
}
