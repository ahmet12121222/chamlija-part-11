import Image from "next/image";
import Link from "next/link";
import type { Promotion } from "@/lib/promotions/types";

function formatDate(date: string | null): string {
  if (!date) {
    return "Not specified";
  }

  const normalizedDate = date.includes("T") ? date.split("T")[0] : date;
  const [year, month, day] = normalizedDate.split("-").map(Number);

  if (!year || !month || !day) {
    return "Not specified";
  }

  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

export function PromotionCard({ promotion }: { promotion: Promotion }) {
  const imageUrl = promotion.image_url || "/chamlija/20.jpeg";
  const discountText = promotion.discount == null ? "Özel teklif" : `%${String(promotion.discount)}`;

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.05)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <div className="relative h-52 overflow-hidden">
        <Image
          src={imageUrl}
          alt={promotion.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute left-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-sm font-bold text-white shadow-lg">
          {discountText}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            {promotion.category}
          </span>
          <span className="text-xs font-medium text-slate-500">Aktif</span>
        </div>

        <div>
          <h3 className="text-xl font-black text-slate-900">{promotion.title}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{promotion.description}</p>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm text-slate-600">
          <span>Geçerlilik</span>
          <span className="font-semibold text-slate-900">
            {formatDate(promotion.start_date)} - {formatDate(promotion.end_date)}
          </span>
        </div>

        <Link
          href={`/promotions/${promotion.id}`}
          className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Detay
        </Link>
      </div>
    </article>
  );
}
