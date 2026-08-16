"use client";

import { useEffect, useState } from "react";
import { getWeatherCodeDescription, getVisitSuitability, type WeatherData } from "@/lib/weather/getWeather";

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/weather");
        if (!response.ok) throw new Error("API error");
        const data = await response.json();
        setWeather(data);
      } catch (err) {
        console.error("Failed to fetch weather:", err);
        setError("Hava durumu şu anda alınamıyor.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (error) {
    return (
      <section className="scroll-mt-24 bg-gradient-to-b from-[#f5f2ec] via-[#efe9e1] to-[#e8dfd4] px-4 py-16 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-[#14251d]/10 bg-white/50 p-8 text-center backdrop-blur-sm">
            <p className="text-sm text-[#49574f]">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (loading || !weather) {
    return (
      <section className="scroll-mt-24 bg-gradient-to-b from-[#f5f2ec] via-[#efe9e1] to-[#e8dfd4] px-4 py-16 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-8 w-64 rounded-lg bg-[#14251d]/10"></div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <div className="h-32 rounded-2xl bg-[#14251d]/10"></div>
            <div className="h-32 rounded-2xl bg-[#14251d]/10"></div>
            <div className="h-32 rounded-2xl bg-[#14251d]/10"></div>
          </div>
        </div>
      </section>
    );
  }

  const currentWeather = getWeatherCodeDescription(weather.current.weatherCode);
  const suitability = getVisitSuitability(weather.current, weather.daily[0].precipitationProbability);
  const uvLevel = getUVLevel(weather.current.uvIndex);

  const suitabilityColor =
    suitability.level === "excellent" ? "🟢" : suitability.level === "good" ? "🟡" : suitability.level === "caution" ? "🟠" : "🔴";

  return (
    <section id="weather" className="scroll-mt-24 bg-gradient-to-b from-[#f5f2ec] via-[#efe9e1] to-[#e8dfd4] px-4 py-16 sm:px-8 lg:px-10 lg:py-28">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .weather-card {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        .weather-card:nth-child(1) { animation-delay: 0.1s; }
        .weather-card:nth-child(2) { animation-delay: 0.2s; }
        .weather-card:nth-child(3) { animation-delay: 0.3s; }
        .weather-card:nth-child(4) { animation-delay: 0.4s; }
        .weather-card:nth-child(5) { animation-delay: 0.5s; }
        .weather-card:nth-child(6) { animation-delay: 0.6s; }
        .weather-card:nth-child(7) { animation-delay: 0.7s; }
      `}</style>

      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-[#7a8462] sm:text-xs">Hava Durumu</p>
          <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#14251d] sm:text-4xl">
            Bugün Chamlija'da hava nasıl?
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#49574f]">Ziyaretinizi planlamadan önce hava durumuna göz atın.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Current Weather */}
          <div className="lg:col-span-1">
            <div className="weather-card rounded-2xl border border-[#14251d]/8 bg-gradient-to-br from-white/70 via-[#f9f7f2]/70 to-white/60 p-6 backdrop-blur-sm transition hover:border-[#14251d]/15 hover:shadow-[0_12px_32px_rgba(20,37,29,0.08)]">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7a8462]">Bugün</p>
              <div className="mt-4 text-5xl">{currentWeather.icon}</div>
              <div className="mt-4">
                <div className="text-4xl font-bold text-[#14251d]">{weather.current.temperature}°</div>
                <p className="mt-1 text-sm text-[#49574f]">{currentWeather.label}</p>
              </div>
              <div className="mt-6 space-y-2 border-t border-[#14251d]/10 pt-4 text-xs text-[#49574f]">
                <div className="flex justify-between">
                  <span>Hissedilen</span>
                  <span className="font-medium text-[#14251d]">{weather.current.apparentTemperature}°</span>
                </div>
                <div className="flex justify-between">
                  <span>Nem</span>
                  <span className="font-medium text-[#14251d]">{weather.current.humidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Rüzgar</span>
                  <span className="font-medium text-[#14251d]">{weather.current.windSpeed} km/s</span>
                </div>
              </div>
              <div className="mt-4 pt-4 text-[10px] text-[#49574f]/60">Son güncelleme: {weather.lastUpdated}</div>
            </div>
          </div>

          {/* UV & Precipitation */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div className="weather-card rounded-2xl border border-[#14251d]/8 bg-gradient-to-br from-white/70 via-[#f9f7f2]/70 to-white/60 p-6 backdrop-blur-sm transition hover:border-[#14251d]/15 hover:shadow-[0_12px_32px_rgba(20,37,29,0.08)]">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7a8462]">UV İNDEKSİ</p>
                <div className="mt-4 flex items-baseline gap-3">
                  <div className="text-4xl font-bold text-[#14251d]">{weather.current.uvIndex}</div>
                  <span className="text-sm text-[#49574f]">{uvLevel}</span>
                </div>
                <p className="mt-3 text-xs leading-5 text-[#49574f]">{getUVAdvice(weather.current.uvIndex)}</p>
              </div>
              <div className="weather-card rounded-2xl border border-[#14251d]/8 bg-gradient-to-br from-white/70 via-[#f9f7f2]/70 to-white/60 p-6 backdrop-blur-sm transition hover:border-[#14251d]/15 hover:shadow-[0_12px_32px_rgba(20,37,29,0.08)]">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7a8462]">YAĞIŞ İHTİMALİ</p>
                <div className="mt-4">
                  <div className="text-3xl font-bold text-[#14251d]">{weather.daily[0].precipitationProbability}%</div>
                  <p className="mt-2 text-xs text-[#49574f]">{weather.daily[0].precipitation}mm bekleniyor</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visit Suitability */}
          <div className="lg:col-span-1">
            <div className="weather-card h-full rounded-2xl border border-[#14251d]/8 bg-gradient-to-br from-white/70 via-[#f9f7f2]/70 to-white/60 p-6 backdrop-blur-sm transition hover:border-[#14251d]/15 hover:shadow-[0_12px_32px_rgba(20,37,29,0.08)]">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7a8462]">ZİYARET DURUMU</p>
              <div className="mt-6 flex flex-col items-center justify-center space-y-4 text-center">
                <div className="text-5xl">{suitabilityColor}</div>
                <p className="text-sm font-semibold text-[#14251d]">{suitability.label}</p>
                <p className="text-xs leading-5 text-[#49574f]">{getVisitMessage(suitability.level, weather.current)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="mt-12">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#14251d]">7 Günlük Hava Tahmini</h3>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            {weather.daily.map((day, i) => {
              const dayWeather = getWeatherCodeDescription(day.weatherCode);
              const dayName = getDayName(day.date, i);
              return (
                <div key={day.date} className="weather-card flex flex-col items-center rounded-xl border border-[#14251d]/8 bg-gradient-to-br from-white/70 via-[#f9f7f2]/70 to-white/60 p-4 backdrop-blur-sm transition hover:-translate-y-1 hover:border-[#14251d]/15 hover:shadow-[0_12px_28px_rgba(20,37,29,0.08)]">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#7a8462]">{dayName}</p>
                  <div className="mt-3 text-3xl">{dayWeather.icon}</div>
                  <div className="mt-3 flex gap-2 text-sm font-semibold text-[#14251d]">
                    <span>{day.maxTemp}°</span>
                    <span className="text-[#49574f]">{day.minTemp}°</span>
                  </div>
                  <p className="mt-2 text-[10px] text-[#49574f]">{day.precipitationProbability}% yağış</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Smart Alert */}
        <div className="mt-10">
          <WeatherAlert weather={weather.current} precipitation={weather.daily[0].precipitationProbability} />
        </div>
      </div>
    </section>
  );
}

function getUVLevel(uvIndex: number): string {
  if (uvIndex <= 2) return "Düşük";
  if (uvIndex <= 5) return "Orta";
  if (uvIndex <= 7) return "Yüksek";
  if (uvIndex <= 10) return "Çok Yüksek";
  return "Aşırı Yüksek";
}

function getUVAdvice(uvIndex: number): string {
  if (uvIndex <= 2) return "UV seviyesi düşük, deri koruması gerekli değil.";
  if (uvIndex <= 5) return "Orta UV seviyesi. Gözlük ve şapka kullanmanız önerilir.";
  if (uvIndex <= 7) return "Yüksek UV. Güneş kremi (SPF 30+) sürmeyi unutmayın.";
  if (uvIndex <= 10) return "Çok yüksek UV. Güneş kremi ve şapka şart. Öğlen saatlerinde dışında kalın.";
  return "Aşırı yüksek UV. Tam korumalı güneş kremini sürün.";
}

function getDayName(date: string, index: number): string {
  if (index === 0) return "Bugün";
  if (index === 1) return "Yarın";
  const d = new Date(date);
  const days = ["Pzr", "Pzt", "Sal", "Çar", "Per", "Cum", "Cts"];
  return days[d.getDay()];
}

function getVisitMessage(level: string, current: WeatherData["current"]): string {
  if (level === "excellent") return "Hava koşulları Chamlija'yı keşfetmek için mükemmel.";
  if (level === "good") {
    if (current.windSpeed > 15) return "Hafif rüzgar var ama aktivite yapmak mümkün.";
    if (current.uvIndex > 6) return "Güneşli bir gün. Güneş koruması alın.";
    return "Açık hava aktiviteleri için uygun.";
  }
  if (level === "caution") {
    if (current.temperature > 30) return "Sıcak bir gün. Bol su için.";
    if (current.windSpeed > 20) return "Kuvvetli rüzgar. Dikkat edin.";
    return "Hava koşullarına dikkat edin.";
  }
  return "Bugün açık hava aktiviteleri uygun değil.";
}

interface WeatherAlertProps {
  weather: WeatherData["current"];
  precipitation: number;
}

function WeatherAlert({ weather, precipitation }: WeatherAlertProps) {
  let alert: { icon: string; title: string; message: string } | null = null;

  if (precipitation > 70) {
    alert = { icon: "🌧️", title: "Yağmur İhtimali", message: "Bugün yağış bekleniyor. Şemsiye almayı unutmayın." };
  } else if (weather.weatherCode >= 95) {
    alert = { icon: "⛈️", title: "Fırtına", message: "Kuvvetli yağış ihtimali. Dikkatli olun." };
  } else if (weather.temperature > 32) {
    alert = { icon: "🌡️", title: "Çok Sıcak", message: "Bol su için ve güneş koruması yapın." };
  } else if (weather.windSpeed > 25) {
    alert = { icon: "💨", title: "Kuvvetli Rüzgar", message: "Bugün kuvvetli rüzgar bekleniyor." };
  }

  if (!alert) return null;

  return (
    <div className="weather-card rounded-2xl border border-[#14251d]/8 bg-gradient-to-br from-white/70 via-[#f9f7f2]/70 to-white/60 p-6 backdrop-blur-sm">
      <div className="flex gap-4">
        <div className="text-4xl flex-shrink-0">{alert.icon}</div>
        <div>
          <h4 className="font-semibold text-[#14251d]">{alert.title}</h4>
          <p className="mt-1 text-sm text-[#49574f]">{alert.message}</p>
        </div>
      </div>
    </div>
  );
}
