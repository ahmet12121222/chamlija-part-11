import { supabase } from "@/lib/supabase/client";
import type { ProductRecord } from "@/lib/products/types";

export async function getProducts(): Promise<{ products: ProductRecord[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("item_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      const fallback = await supabase.from("picnic_areas").select("*").eq("is_active", true).order("name", { ascending: true });

      if (fallback.error) {
        return { products: [], error: error.message };
      }

      return {
        products: (fallback.data ?? []).map((item) => ({
          id: item.id,
          name: item.name,
          category: "picnic_area",
          description: item.description ?? null,
          price: Number(item.price ?? item.capacity ?? 0),
          currency: "ZAR",
          is_active: item.is_active ?? true,
          is_bookable: true,
          is_free: false,
          size: null,
          entry_fee_excluded: false,
          image_url: null,
          item_order: 0,
        })) as ProductRecord[],
        error: null,
      };
    }

    return { products: (data ?? []) as ProductRecord[], error: null };
  } catch (error) {
    return {
      products: [],
      error: error instanceof Error ? error.message : "Unable to load products.",
    };
  }
}

export async function getProductById(productId: string): Promise<ProductRecord | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as ProductRecord;
  } catch {
    return null;
  }
}
