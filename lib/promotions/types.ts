export const PROMOTION_CATEGORIES = [
  "Konaklama",
  "Yeme & İçme",
  "Etkinlik",
  "Doğa",
  "Diğer",
] as const;

export type PromotionCategory = (typeof PROMOTION_CATEGORIES)[number];
export type PromotionCategoryFilter = PromotionCategory | "Tümü";

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  discount: number | string | null;
  category: PromotionCategory;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PromotionListResult {
  promotions: Promotion[];
  error: string | null;
}
