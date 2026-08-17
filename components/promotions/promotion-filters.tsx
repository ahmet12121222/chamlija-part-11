"use client";

import { useLanguage } from "@/components/site/language-provider";
import type { PromotionCategoryFilter } from "@/lib/promotions/types";

interface PromotionFiltersProps {
  activeFilter: PromotionCategoryFilter;
  onChange: (filter: PromotionCategoryFilter) => void;
}

export function PromotionFilters({ activeFilter, onChange }: PromotionFiltersProps) {
  const { t } = useLanguage();

  const filters: Array<{ id: PromotionCategoryFilter; label: string }> = [
    { id: "Tümü", label: t("promotions.all", "All") },
    { id: "Konaklama", label: t("promotions.accommodation", "Accommodation") },
    { id: "Yeme & İçme", label: t("promotions.foodAndBeverage", "Food & Beverage") },
    { id: "Etkinlik", label: t("promotions.events", "Events") },
    { id: "Doğa", label: t("promotions.nature", "Nature") },
    { id: "Diğer", label: t("promotions.other", "Other") },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={[
            "rounded-full border px-4 py-2 text-sm font-semibold transition",
            activeFilter === item.id
              ? "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
              : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700",
          ].join(" ")}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
