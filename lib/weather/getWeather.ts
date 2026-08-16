// Server-side weather data fetching from Open-Meteo
// No API key needed, free and reliable

import { unstable_cache } from "next/cache";

export type WeatherCode =
  | 0 | 1 | 2 | 3 | 45 | 48
  | 51 | 53 | 55 | 61 | 63 | 65 | 71 | 73 | 75
  | 80 | 81 | 82 | 85 | 86 | 95 | 96 | 99;

export type WeatherData = {
  current: {
    temperature: number;
    apparentTemperature: number;
    weatherCode: WeatherCode;
    humidity: number;
    windSpeed: number;
    uvIndex: number;
    time: string;
  };
  daily: {
    date: string;
    maxTemp: number;
    minTemp: number;
    weatherCode: WeatherCode;
    precipitation: number;
    precipitationProbability: number;
    uvIndex: number;
  }[];
  timezone: string;
  lastUpdated: string;
};

const CHAMLIJA_COORDS = {
  latitude: -25.8257,
  longitude: 28.11074,
};

const getWeatherCodeDescription = (code: WeatherCode): { icon: string; label: string; description: string } => {
  // Map WMO weather codes to descriptions
  if (code === 0) return { icon: "☀️", label: "Güneşli", description: "Açık gökyüzü" };
  if (code === 1 || code === 2) return { icon: "🌤️", label: "Çoğunlukla Açık", description: "Ufak bulutlar" };
  if (code === 3) return { icon: "☁️", label: "Bulutlu", description: "Kapalı gökyüzü" };
  if (code === 45 || code === 48) return { icon: "🌫️", label: "Sisli", description: "Sis veya duman" };
  if (code >= 51 && code <= 57) return { icon: "🌧️", label: "Hafif Yağış", description: "Çiseleme" };
  if (code === 61 || code === 63 || code === 65) return { icon: "🌧️", label: "Yağmur", description: "Yağmur bekleniyor" };
  if (code === 71 || code === 73 || code === 75) return { icon: "❄️", label: "Kar", description: "Kar yağışı" };
  if (code === 80 || code === 81 || code === 82) return { icon: "🌧️", label: "Sağanaklar", description: "Şiddetli yağış" };
  if (code === 85 || code === 86) return { icon: "🌨️", label: "Kar Fırtınası", description: "Kar sağanakları" };
  if (code === 95 || code === 96 || code === 99) return { icon: "⛈️", label: "Fırtına", description: "Gök gürültülü sağanaklar" };
  return { icon: "❓", label: "Bilinmiyor", description: "Hava durumu bilinmiyor" };
};

const getVisitSuitability = (data: WeatherData["current"], precip: number): { level: "excellent" | "good" | "caution" | "poor"; label: string } => {
  const { temperature, uvIndex, windSpeed } = data;
  const precipProb = precip;

  // Poor: heavy rain, extreme temp, or high wind
  if (precipProb > 70 || temperature < 5 || temperature > 35 || windSpeed > 30) {
    return { level: "poor", label: "Açık hava için pek uygun değil" };
  }

  // Caution: moderate rain, warm, or moderate wind
  if (precipProb > 40 || temperature > 30 || windSpeed > 20 || uvIndex > 9) {
    return { level: "caution", label: "Hava koşullarına dikkat" };
  }

  // Good: some sun, light conditions
  if (precipProb > 10 || uvIndex > 6) {
    return { level: "good", label: "Ziyaret için uygun" };
  }

  // Excellent: clear, nice temp, low wind
  return { level: "excellent", label: "Ziyaret için harika!" };
};

async function fetchWeatherData(): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: CHAMLIJA_COORDS.latitude.toString(),
    longitude: CHAMLIJA_COORDS.longitude.toString(),
    current: "temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m,uv_index",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,uv_index_max",
    timezone: "Africa/Johannesburg",
    forecast_days: "7",
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 600 }, // Cache for 10 minutes
    });

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const raw = await response.json();

    const current = raw.current;
    const daily = raw.daily;

    return {
      current: {
        temperature: Math.round(current.temperature_2m),
        apparentTemperature: Math.round(current.apparent_temperature),
        weatherCode: current.weather_code as WeatherCode,
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
        uvIndex: Math.round(current.uv_index * 10) / 10,
        time: current.time,
      },
      daily: daily.time.map(
        (date: string, i: number) => ({
          date,
          maxTemp: Math.round(daily.temperature_2m_max[i]),
          minTemp: Math.round(daily.temperature_2m_min[i]),
          weatherCode: daily.weather_code[i] as WeatherCode,
          precipitation: Math.round(daily.precipitation_sum[i] * 10) / 10,
          precipitationProbability: daily.precipitation_probability_max[i],
          uvIndex: Math.round(daily.uv_index_max[i] * 10) / 10,
        })
      ) as WeatherData["daily"],
      timezone: raw.timezone,
      lastUpdated: new Date().toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  } catch (error) {
    console.error("Weather fetch error:", error);
    throw error;
  }
}

// Cache the weather data for 10 minutes
export const getCachedWeather = unstable_cache(fetchWeatherData, ["weather"], {
  revalidate: 600,
  tags: ["weather"],
});

export { getWeatherCodeDescription, getVisitSuitability, CHAMLIJA_COORDS };
