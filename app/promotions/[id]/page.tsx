import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPromotionById } from "@/lib/promotions/service";

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

export default async function PromotionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const promotion = await getPromotionById(id);

  if (!promotion) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-800">
          ← Ana sayfaya dön
        </Link>

        <article className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div className="grid gap-0 lg:grid-cols-2">
            <div className="relative min-h-[280px] bg-slate-200">
              <Image
                src={promotion.image_url || "/chamlija/20.jpeg"}
                alt={promotion.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute left-5 top-5 rounded-full bg-emerald-600 px-4 py-2 text-lg font-black text-white">
                {promotion.discount == null ? "Özel teklif" : `%${String(promotion.discount)}`}
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              <div className="mb-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                {promotion.category}
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{promotion.title}</h1>
              <p className="mt-5 text-base leading-7 text-slate-600">{promotion.description}</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Başlangıç</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{formatDate(promotion.start_date)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Bitiş</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{formatDate(promotion.end_date)}</p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Durum</p>
                <p className="mt-2 text-xl font-black text-slate-900">
                  {promotion.is_active ? "Aktif promosyon" : "Pasif promosyon"}
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
