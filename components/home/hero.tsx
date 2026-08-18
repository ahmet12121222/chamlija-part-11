"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/site/language-provider";
import { CHAMLIJA_MAPS_URL } from "@/lib/location";
import { HERO_IMAGES } from "@/lib/media/chamlija-images";

export function Hero() {
  const { t } = useLanguage();
  const [primary] = HERO_IMAGES;

  return (
    <section id="home" className="relative flex min-h-[68vh] scroll-mt-24 items-end overflow-hidden bg-[#1b2f26] sm:min-h-screen">
      <Image
        src={primary.src}
        alt={primary.alt}
        fill
        priority
        className="object-cover scale-[1.05]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),linear-gradient(90deg,rgba(20,37,29,0.72)_0%,rgba(20,37,29,0.36)_42%,rgba(20,37,29,0.2)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#f5f1e8] to-transparent sm:h-40" />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-9 pt-24 sm:px-8 sm:pb-16 sm:pt-28 lg:px-10 lg:pb-28 lg:pt-40">
        <div className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm sm:text-[10px] sm:tracking-[0.22em]">
          {t("hero.badge", "Buyuk Chamlija · South Africa")}
        </div>
        <h1 className="mt-4 max-w-[10ch] text-[2.5rem] font-semibold leading-[0.92] tracking-[-0.06em] text-white drop-shadow-[0_18px_35px_rgba(0,0,0,0.18)] sm:mt-6 sm:max-w-3xl sm:text-5xl lg:text-7xl">
          {t("hero.title", "Escape into nature at Chamlija")}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 sm:mt-5 sm:text-base sm:leading-8 lg:text-lg">
          {t("hero.description", "Enjoy a peaceful day in nature with picnic areas, outdoor experiences, family-friendly activities, and memorable celebrations.")}
        </p>
        <div className="mt-6 flex w-full max-w-xl flex-col gap-3 sm:mt-8 sm:flex-row">
          <Link
            href="/book"
            className="inline-flex w-full items-center justify-center rounded-full bg-[#f3eadb] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#14251d] shadow-[0_16px_30px_rgba(20,37,29,0.16)] transition hover:-translate-y-0.5 hover:bg-white sm:w-auto sm:px-8 sm:py-3.5 sm:text-sm"
          >
            {t("common.reserveYourVisit", "Reserve Your Visit")}
          </Link>
          <a
            href={CHAMLIJA_MAPS_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center rounded-full border border-red-400/50 bg-red-600/35 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_8px_20px_rgba(220,38,38,0.25)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-red-300/70 hover:bg-red-500/50 sm:w-auto sm:px-8 sm:py-3.5 sm:text-sm"
          >
            📍 {t("common.location", "Location")}
          </a>
        </div>
      </div>
    </section>
  );
}
