export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
}

const WMO_CONDITIONS: Record<number, string> = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Foggy",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Rain showers",
  82: "Heavy rain showers",
  95: "Thunderstorm",
};

function wmoToCondition(code: number): string {
  return WMO_CONDITIONS[code] ?? "Unknown";
}

export async function fetchWeather(
  latitude: number,
  longitude: number
): Promise<WeatherData | null> {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current: "temperature_2m,relative_humidity_2m,weather_code",
    timezone: "auto",
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    next: { revalidate: 900 },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    current?: {
      temperature_2m?: number;
      relative_humidity_2m?: number;
      weather_code?: number;
    };
  };

  const current = data.current;
  if (!current || current.temperature_2m === undefined) {
    return null;
  }

  return {
    temp: Math.round(current.temperature_2m),
    condition: wmoToCondition(current.weather_code ?? 0),
    humidity: Math.round(current.relative_humidity_2m ?? 0),
  };
}
