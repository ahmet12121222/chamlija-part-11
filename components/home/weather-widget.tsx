"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/site/language-provider";
import { getWeatherCodeDescription, getVisitSuitability, type WeatherData } from "@/lib/weather/getWeather";

export function WeatherWidget() {
  const { t } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showForecast, setShowForecast] = useState(false);

  const getUVLevel = (uvIndex: number): string => {
    if (uvIndex <= 2) return t("weatherLevels.low", "Low");
    if (uvIndex <= 5) return t("weatherLevels.moderate", "Moderate");
    if (uvIndex <= 7) return t("weatherLevels.high", "High");
    if (uvIndex <= 10) return t("weatherLevels.veryHigh", "Very High");
    return t("weatherLevels.extreme", "Extreme");
  };

  const getUVAdvice = (uvIndex: number): string => {
    if (uvIndex <= 2) return t("uvAdvice.low", "UV level is low, skin protection is not necessary.");
    if (uvIndex <= 5) return t("uvAdvice.moderate", "Moderate UV level. Sunglasses and a hat are recommended.");
    if (uvIndex <= 7) return t("uvAdvice.high", "High UV. Don't forget sunscreen (SPF 30+).");
    if (uvIndex <= 10) return t("uvAdvice.veryHigh", "Very high UV. Sunscreen and hat required. Avoid outdoors during midday.");
    return t("uvAdvice.extreme", "Extreme UV. Apply full protection sunscreen.");
  };

  const getVisitMessage = (level: string, current: WeatherData["current"]): string => {
    if (level === "excellent") return t("visitSuitability.excellent", "Weather conditions are excellent for exploring Chamlija.");
    if (level === "good") {
      if (current.windSpeed > 15) return t("visitSuitability.goodWithWind", "Light wind is present but activities are still possible.");
      if (current.uvIndex > 6) return t("visitSuitability.goodWithSun", "Sunny day. Get sun protection.");
      return t("visitSuitability.good", "Suitable for outdoor activities.");
    }
    if (level === "caution") {
      if (current.temperature > 30) return t("visitSuitability.cautionHot", "Hot day. Drink plenty of water.");
      if (current.windSpeed > 20) return t("visitSuitability.cautionWind", "Strong wind. Be cautious.");
      return t("visitSuitability.caution", "Pay attention to weather conditions.");
    }
    return t("visitSuitability.notSuitable", "Outdoor activities are not recommended today.");
  };

  const getDayName = (date: string, index: number): string => {
    if (index === 0) return t("common.today", "Today");
    if (index === 1) return t("common.tomorrow", "Tomorrow");
    const d = new Date(date);
    const days = [t("days.sunday", "Sun"), t("days.monday", "Mon"), t("days.tuesday", "Tue"), t("days.wednesday", "Wed"), t("days.thursday", "Thu"), t("days.friday", "Fri"), t("days.saturday", "Sat")];
    return days[d.getDay()];
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const syncViewport = () => {
      setIsMobile(mediaQuery.matches);
      if (!mediaQuery.matches) {
        setShowForecast(false);
      }
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

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
        setError("Weather information is currently unavailable.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const skyBackground = "radial-gradient(circle at top left, rgba(213, 234, 249, 0.9) 0%, rgba(248, 252, 255, 0.9) 18%, rgba(230, 240, 252, 0.82) 34%, rgba(255, 255, 255, 0.88) 50%, rgba(245, 239, 221, 0.8) 74%, rgba(255, 249, 240, 0.9) 100%)";

  if (error) {
    return (
      <section className="relative scroll-mt-24 overflow-hidden px-4 py-16 sm:px-8 lg:px-10 lg:py-28" style={{ background: skyBackground }}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 top-12 h-52 w-52 rounded-full bg-[#d9f0ff]/60 blur-3xl" />
          <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-[#f9e7a7]/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-[#dff2d8]/25 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl">
          <div className="rounded-2xl border border-[#14251d]/10 bg-white/50 p-8 text-center backdrop-blur-sm">
            <p className="text-sm text-[#49574f]">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (loading || !weather) {
    return (
      <section className="relative scroll-mt-24 overflow-hidden px-4 py-16 sm:px-8 lg:px-10 lg:py-28" style={{ background: skyBackground }}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 top-12 h-52 w-52 rounded-full bg-[#d9f0ff]/60 blur-3xl" />
          <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-[#f9e7a7]/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-[#dff2d8]/25 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl animate-pulse">
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

  if (isMobile) {
    return (
      <section id="weather" className="relative scroll-mt-24 overflow-hidden px-4 py-6 sm:px-8 lg:px-10 lg:py-28" style={{ background: skyBackground }}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-8 top-6 h-28 w-28 rounded-full bg-[#dfeffc]/75 blur-3xl" />
          <div className="absolute right-6 top-10 h-32 w-32 rounded-full bg-[#fbe6a3]/35 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-md">
          <div className="rounded-[1.75rem] border border-[#14251d]/10 bg-white/60 p-4 shadow-[0_16px_36px_rgba(20,37,29,0.08)] backdrop-blur-sm">
            <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#7a8462]">Weather at Chamlija</p>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="text-4xl leading-none">{currentWeather.icon}</div>
                <div>
                  <div className="text-[2rem] font-bold leading-none tracking-[-0.05em] text-[#14251d]">{weather.current.temperature}°C</div>
                  <div className="mt-1 text-sm text-[#49574f]">{currentWeather.label}</div>
                </div>
              </div>
              <div className="text-right text-[10px] uppercase tracking-[0.1em] text-[#7a8462]">
                {suitability.label}
              </div>
            </div>

            <div className="mt-4 space-y-2 border-t border-[#14251d]/10 pt-3 text-sm text-[#49574f]">
              <div className="flex items-center justify-between gap-2">
                <span>Feels like</span>
                <span className="font-semibold text-[#14251d]">{weather.current.apparentTemperature}°C</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>Humidity</span>
                <span className="font-semibold text-[#14251d]">{weather.current.humidity}%</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>Wind</span>
                <span className="font-semibold text-[#14251d]">{weather.current.windSpeed} km/h</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>Rain</span>
                <span className="font-semibold text-[#14251d]">{weather.daily[0].precipitationProbability}%</span>
              </div>
            </div>

            <p className="mt-4 text-sm leading-5 text-[#49574f]">
              {getVisitMessage(suitability.level, weather.current)}
            </p>

            {showForecast ? (
              <div className="mt-4 border-t border-[#14251d]/10 pt-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#7a8462]">7-Day Forecast</p>
                  <button type="button" onClick={() => setShowForecast(false)} className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#14251d]">Hide</button>
                </div>
                <div className="space-y-2">
                  {weather.daily.map((day, i) => {
                    const dayWeather = getWeatherCodeDescription(day.weatherCode);
                    const dayName = getDayName(day.date, i);
                    return (
                      <div key={day.date} className="flex items-center justify-between rounded-xl border border-[#14251d]/8 bg-white/40 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{dayWeather.icon}</span>
                          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#14251d]">{dayName}</span>
                        </div>
                        <div className="text-right text-xs font-semibold text-[#14251d]">
                          <span>{day.maxTemp}°</span>
                          <span className="mx-1 text-[#49574f]">/ {day.minTemp}°</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setShowForecast(true)} className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-[#14251d]/10 bg-[#f3f4ef] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#14251d]">
                View 7-day forecast
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="weather" className="relative scroll-mt-24 overflow-hidden px-4 py-10 sm:px-8 sm:py-16 lg:px-10 lg:py-28" style={{ background: skyBackground }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-8 top-10 h-56 w-56 rounded-full bg-[#dfeffc]/75 blur-3xl" />
        <div className="absolute right-14 top-16 h-72 w-72 rounded-full bg-[#fbe6a3]/25 blur-3xl" />
        <div className="absolute bottom-4 left-1/4 h-64 w-64 rounded-full bg-[#d9f1d1]/25 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-52 w-52 rounded-full bg-[#d9edff]/30 blur-3xl" />
      </div>
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

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-6 sm:mb-12">
          <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#7a8462] sm:text-xs">{t("common.weather", "Weather")}</p>
          <h2 className="mt-3 text-[1.9rem] font-semibold leading-[1.08] tracking-[-0.04em] text-[#14251d] sm:mt-4 sm:text-4xl">
            {t("weather.heading", "What is the weather like at Chamlija today?")}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#49574f] sm:mt-3">{t("weather.subheading", "Check the weather before planning your visit.")}</p>
        </div>

        <div className="grid gap-4 sm:gap-8 lg:grid-cols-3">
          {/* Current Weather */}
          <div className="lg:col-span-1">
            <div className="weather-card rounded-2xl border border-[#14251d]/8 bg-gradient-to-br from-white/70 via-[#f9f7f2]/70 to-white/60 p-4 backdrop-blur-sm transition hover:border-[#14251d]/15 hover:shadow-[0_12px_32px_rgba(20,37,29,0.08)] sm:p-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#7a8462] sm:text-xs">Today</p>
              <div className="mt-3 text-4xl sm:mt-4 sm:text-5xl">{currentWeather.icon}</div>
              <div className="mt-3 sm:mt-4">
                <div className="text-3xl font-bold text-[#14251d] sm:text-4xl">{weather.current.temperature}°</div>
                <p className="mt-1 text-sm text-[#49574f]">{currentWeather.label}</p>
              </div>
              <div className="mt-4 space-y-2 border-t border-[#14251d]/10 pt-3 text-[11px] text-[#49574f] sm:mt-6 sm:pt-4 sm:text-xs">
                <div className="flex justify-between">
                  <span>Feels like</span>
                  <span className="font-medium text-[#14251d]">{weather.current.apparentTemperature}°</span>
                </div>
                <div className="flex justify-between">
                  <span>Humidity</span>
                  <span className="font-medium text-[#14251d]">{weather.current.humidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Wind</span>
                  <span className="font-medium text-[#14251d]">{weather.current.windSpeed} km/h</span>
                </div>
              </div>
              <div className="mt-4 pt-4 text-[10px] text-[#49574f]/60">Last updated: {weather.lastUpdated}</div>
            </div>
          </div>

          {/* UV & Precipitation */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div className="weather-card rounded-2xl border border-[#14251d]/8 bg-gradient-to-br from-white/70 via-[#f9f7f2]/70 to-white/60 p-4 backdrop-blur-sm transition hover:border-[#14251d]/15 hover:shadow-[0_12px_32px_rgba(20,37,29,0.08)] sm:p-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#7a8462] sm:text-xs">UV INDEX</p>
                <div className="mt-3 flex items-baseline gap-3 sm:mt-4">
                  <div className="text-3xl font-bold text-[#14251d] sm:text-4xl">{weather.current.uvIndex}</div>
                  <span className="text-sm text-[#49574f]">{uvLevel}</span>
                </div>
                <p className="mt-3 text-[11px] leading-5 text-[#49574f] sm:text-xs">{getUVAdvice(weather.current.uvIndex)}</p>
              </div>
              <div className="weather-card rounded-2xl border border-[#14251d]/8 bg-gradient-to-br from-white/70 via-[#f9f7f2]/70 to-white/60 p-4 backdrop-blur-sm transition hover:border-[#14251d]/15 hover:shadow-[0_12px_32px_rgba(20,37,29,0.08)] sm:p-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#7a8462] sm:text-xs">RAIN CHANCE</p>
                <div className="mt-3 sm:mt-4">
                  <div className="text-2xl font-bold text-[#14251d] sm:text-3xl">{weather.daily[0].precipitationProbability}%</div>
                  <p className="mt-2 text-[11px] text-[#49574f] sm:text-xs">{weather.daily[0].precipitation}mm expected</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visit Suitability */}
          <div className="lg:col-span-1">
            <div className="weather-card h-full rounded-2xl border border-[#14251d]/8 bg-gradient-to-br from-white/70 via-[#f9f7f2]/70 to-white/60 p-4 backdrop-blur-sm transition hover:border-[#14251d]/15 hover:shadow-[0_12px_32px_rgba(20,37,29,0.08)] sm:p-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#7a8462] sm:text-xs">VISIT SUITABILITY</p>
              <div className="mt-4 flex flex-col items-center justify-center space-y-4 text-center sm:mt-6">
                <div className="text-4xl sm:text-5xl">{suitabilityColor}</div>
                <p className="text-sm font-semibold text-[#14251d]">{suitability.label}</p>
                <p className="text-[11px] leading-5 text-[#49574f] sm:text-xs">{getVisitMessage(suitability.level, weather.current)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="mt-12">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#14251d]">7-Day Forecast</h3>
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
                  <p className="mt-2 text-[10px] text-[#49574f]">{day.precipitationProbability}% rain</p>
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
