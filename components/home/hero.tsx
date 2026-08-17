"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/site/language-provider";
import { HERO_IMAGES } from "@/lib/media/chamlija-images";

export function Hero() {
  const { t } = useLanguage();
  const [primary] = HERO_IMAGES;

  return (
    <section id="home" className="relative flex min-h-screen scroll-mt-24 items-end overflow-hidden bg-[#1b2f26]">
      <Image
        src={primary.src}
        alt={primary.alt}
        fill
        priority
        className="object-cover scale-[1.05]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),linear-gradient(90deg,rgba(20,37,29,0.72)_0%,rgba(20,37,29,0.36)_42%,rgba(20,37,29,0.2)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f5f1e8] to-transparent" />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-28 sm:px-8 lg:px-10 lg:pb-28 lg:pt-40">
        <div className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-white/80 backdrop-blur-sm">
          {t("hero.badge", "Buyuk Chamlija · South Africa")}
        </div>
        <h1 className="mt-6 max-w-[12ch] text-4xl font-semibold leading-[0.92] tracking-[-0.06em] text-white drop-shadow-[0_18px_35px_rgba(0,0,0,0.18)] sm:max-w-3xl sm:text-5xl lg:text-7xl">
          {t("hero.title", "Escape into nature at Chamlija")}
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-white/80 sm:text-base sm:leading-8 lg:text-lg">
          {t("hero.description", "Enjoy a peaceful day in nature with picnic areas, outdoor experiences, family-friendly activities, and memorable celebrations.")}
        </p>
        <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row">
          <Link
            href="/book"
            className="inline-flex w-full items-center justify-center rounded-full bg-[#f3eadb] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-[#14251d] shadow-[0_16px_30px_rgba(20,37,29,0.16)] transition hover:-translate-y-0.5 hover:bg-white sm:w-auto sm:px-8"
          >
            {t("common.reserveYourVisit", "Reserve Your Visit")}
          </Link>
          <a
            href="#experiences"
            className="inline-flex w-full items-center justify-center rounded-full border border-white/30 bg-white/5 px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/10 sm:w-auto sm:px-8"
          >
            {t("common.explore", "Explore Chamlija")}
          </a>
        </div>
      </div>
    </section>
  );
}
