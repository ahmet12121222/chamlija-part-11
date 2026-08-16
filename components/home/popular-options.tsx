import Image from "next/image";
import Link from "next/link";
import type { ProductRecord } from "@/lib/products/types";
import { getProductImage } from "@/lib/media/chamlija-images";

const CATEGORY_LABELS: Record<string, string> = {
  picnic_area: "Picnic Area",
  equipment: "Equipment",
  paid_activity: "Activity",
  tent_event_area: "Tent & Event Area",
  photo_shoot: "Photo Shoot",
};

export function PopularOptions({ products }: { products: ProductRecord[] }) {
  const options = products
    .filter((product) => product.is_active && product.is_bookable && !product.is_free && product.category !== "free_activity")
    .sort((a, b) => (a.item_order ?? 0) - (b.item_order ?? 0) || a.name.localeCompare(b.name))
    .slice(0, 6);

  return (
    <section id="popular-options" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-8 lg:px-10 lg:py-28">
      <div className="max-w-xl">
        <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-[#7a8462] sm:text-xs">Popular Options</p>
        <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#14251d] sm:text-4xl">
          Loved by our guests
        </h2>
      </div>

      {options.length === 0 ? (
        <p className="mt-10 text-[#49574f]">Pricing will appear here once the catalog is available.</p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {options.map((product) => {
            const image = getProductImage(product);
            return (
              <div key={product.id} className="group flex flex-col overflow-hidden rounded-[1.4rem] border border-[#e7e7e0] bg-white shadow-[0_10px_22px_rgba(20,37,29,0.04)] transition hover:shadow-[0_14px_30px_rgba(20,37,29,0.08)]">
                <div className="relative h-56 overflow-hidden bg-[#f2f1ed]">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#14251d] backdrop-blur-sm">
                    {CATEGORY_LABELS[product.category] ?? product.category}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-between px-4 pb-5 pt-5 sm:px-5">
                  <div>
                    <h3 className="text-lg font-semibold text-[#14251d]">{product.name}</h3>
                    {product.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#49574f]">{product.description}</p>
                    )}
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-lg font-semibold text-[#14251d]">
                      {product.currency ?? "ZAR"} {Number(product.price ?? 0).toLocaleString()}
                    </span>
                    <Link
                      href="/book"
                      className="inline-flex items-center justify-center rounded-full bg-[#14251d] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#1b3129]"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
