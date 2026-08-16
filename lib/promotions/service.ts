import { supabase } from "@/lib/supabase/client";
import type { Promotion, PromotionListResult } from "@/lib/promotions/types";

function isWithinDateWindow(promotion: Promotion): boolean {
  const today = new Date().toISOString().slice(0, 10);

  if (!promotion.start_date && !promotion.end_date) {
    return true;
  }

  const startDate = promotion.start_date ?? "0000-00-00";
  const endDate = promotion.end_date ?? "9999-12-31";

  return startDate <= today && endDate >= today;
}

export async function getPromotions(): Promise<PromotionListResult> {
  try {
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      return {
        promotions: [],
        error: error.message,
      };
    }

    const promotions = ((data ?? []) as Promotion[]).filter(isWithinDateWindow);

    return {
      promotions,
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Promosyonlar yüklenirken bir hata oluştu.";

    return {
      promotions: [],
      error: message,
    };
  }
}

export async function getPromotionById(id: string): Promise<Promotion | null> {
  try {
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return null;
    }

    const promotion = data as Promotion;

    if (!isWithinDateWindow(promotion)) {
      return null;
    }

    return promotion;
  } catch {
    return null;
  }
}
