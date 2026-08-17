"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/site/language-provider";
import { ABOUT_IMAGES } from "@/lib/media/chamlija-images";

export function AboutSection() {
  const { t } = useLanguage();
  const [first, second] = ABOUT_IMAGES;

  return (
    <section id="about" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-8 lg:px-10 lg:py-28">
      <div className="absolute inset-x-10 top-0 h-32 rounded-full bg-[#dfe9d6]/60 blur-3xl" aria-hidden="true" />
      <div className="relative grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
        <div className="relative">
          <div className="relative h-[20rem] overflow-hidden rounded-[2rem] bg-[#eef2ea] shadow-[0_24px_60px_rgba(20,37,29,0.08)] sm:h-[26rem] lg:h-[31rem]">
            <Image src={first.src} alt={first.alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
          <div className="absolute -bottom-6 right-4 hidden h-36 w-44 overflow-hidden rounded-[1.4rem] border border-white/60 bg-white/60 shadow-[0_18px_36px_rgba(20,37,29,0.12)] backdrop-blur-[1px] sm:block lg:-bottom-10 lg:-right-6 lg:h-40 lg:w-56">
            <Image src={second.src} alt={second.alt} fill className="object-cover" sizes="224px" />
          </div>
        </div>

        <div className="lg:pl-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-[#7a8462] sm:text-xs">{t("about.eyebrow", "Welcome to Chamlija")}</p>
          <h2 className="mt-4 text-3xl font-semibold leading-[1.06] tracking-[-0.04em] text-[#14251d] sm:text-4xl lg:text-[2.7rem]">
            {t("about.heading", "A place to slow down")}
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-[#49574f] sm:leading-8">
            {t("about.body", "Buyuk Chamlija brings together shaded picnic corners, open lawns and event spaces surrounded by nature. Whether you're planning a relaxed family picnic, a celebration under a tent, or an active day out with friends, Chamlija offers a peaceful setting with everything you need close at hand.")}
          </p>
          <Link
            href="#experiences"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#14251d] transition hover:text-[#7a8462]"
          >
            {t("about.cta", "Explore the grounds")}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
