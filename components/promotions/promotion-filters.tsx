import type { PromotionCategoryFilter } from "@/lib/promotions/types";

const filters: PromotionCategoryFilter[] = [
  "Tümü",
  "Konaklama",
  "Yeme & İçme",
  "Etkinlik",
  "Doğa",
  "Diğer",
];

interface PromotionFiltersProps {
  activeFilter: PromotionCategoryFilter;
  onChange: (filter: PromotionCategoryFilter) => void;
}

export function PromotionFilters({ activeFilter, onChange }: PromotionFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onChange(filter)}
          className={[
            "rounded-full border px-4 py-2 text-sm font-semibold transition",
            activeFilter === filter
              ? "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
              : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700",
          ].join(" ")}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
