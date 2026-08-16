import Image from "next/image";
import Link from "next/link";
import { FINAL_CTA_IMAGE } from "@/lib/media/chamlija-images";

export function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden py-20 sm:py-28 lg:py-36">
      <Image
        src={FINAL_CTA_IMAGE.src}
        alt={FINAL_CTA_IMAGE.alt}
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[#14251d]/68" />

      <div className="relative mx-auto max-w-2xl px-4 text-center text-white sm:px-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-white/75 sm:text-xs">Chamlija awaits</p>
        <h2 className="mt-4 text-3xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
          Ready for a day at Chamlija?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
          Plan your visit and choose your perfect picnic area.
        </p>
        <Link
          href="/book"
          className="mt-9 inline-flex w-full items-center justify-center rounded-full bg-[#e8e1d4] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-[#14251d] transition hover:bg-white sm:w-auto sm:px-8"
        >
          Reserve Your Visit
        </Link>
      </div>
    </section>
  );
}
