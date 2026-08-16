import type { ProductRecord } from "@/lib/products/types";

export function FreeActivities({ products }: { products: ProductRecord[] }) {
  const freeActivities = products
    .filter((product) => product.category === "free_activity" && product.is_active)
    .sort((a, b) => (a.item_order ?? 0) - (b.item_order ?? 0) || a.name.localeCompare(b.name));

  if (freeActivities.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-8 lg:px-10">
        <div className="max-w-xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-[#7a8462] sm:text-xs">Free For Everyone</p>
          <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#14251d] sm:text-4xl">
            There&apos;s more to explore
          </h2>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {freeActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-[#e4e8df] bg-[#f8f7f3] px-4 py-4 sm:px-5"
            >
              <span className="font-medium text-[#1a2b24]">{activity.name}</span>
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a8462]">
                Included
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
