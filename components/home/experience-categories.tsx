"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/site/language-provider";
import { CATEGORY_IMAGES } from "@/lib/media/chamlija-images";

export function ExperienceCategories() {
  const { t } = useLanguage();

  const CATEGORIES = [
    {
      key: "picnic_area",
      title: t("experiences.categories.picnic_area", "Picnic Areas"),
      description: "Shaded, family-friendly corners perfect for relaxed picnics of any size.",
      span: "lg:col-span-7",
      height: "h-[27rem]",
    },
    {
      key: "tent_event_area",
      title: t("experiences.categories.tent_event_area", "Tents & Events"),
      description: "Open lawns and framed tents ready for celebrations and gatherings.",
      span: "lg:col-span-5",
      height: "h-[27rem]",
    },
    {
      key: "paid_activity",
      title: t("experiences.categories.paid_activity", "Activities"),
      description: "Fun, active experiences for guests of all ages to enjoy together.",
      span: "lg:col-span-5",
      height: "h-[18rem]",
    },
    {
      key: "photo_shoot",
      title: t("experiences.categories.photo_shoot", "Photo Shoots"),
      description: "Scenic natural backdrops for portraits, events and special occasions.",
      span: "lg:col-span-7",
      height: "h-[18rem]",
    },
  ] as const;

  return (
    <section id="experiences" className="scroll-mt-24 bg-[#f7f4ee] py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-8 lg:px-10">
        <div className="max-w-xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-[#7a8462] sm:text-xs">{t("experiences.eyebrow", "Experiences")}</p>
          <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#14251d] sm:text-4xl">
            {t("experiences.heading", "Choose your Chamlija experience")}
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-5">
          {CATEGORIES.map((category) => {
            const image = CATEGORY_IMAGES[category.key];
            return (
              <Link
                key={category.key}
                href="/book"
                className={`group relative block min-h-[18rem] overflow-hidden rounded-[1.75rem] bg-[#edf0ea] shadow-[0_16px_30px_rgba(20,37,29,0.06)] sm:min-h-0 ${category.span} ${category.height}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14251d]/82 via-[#14251d]/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7">
                  <h3 className="text-xl font-semibold text-white sm:text-2xl">{category.title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-white/75">{category.description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#e8e1d4] transition group-hover:text-white">
                    {t("common.bookNow", "Book Now")}
                    <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
