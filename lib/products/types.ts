export type ProductCategory =
  | "picnic_area"
  | "equipment"
  | "free_activity"
  | "paid_activity"
  | "tent_event_area"
  | "photo_shoot";

export type ProductRecord = {
  id: string;
  name: string;
  category: ProductCategory;
  description?: string | null;
  price: number;
  currency: string;
  is_active: boolean;
  is_bookable: boolean;
  is_free: boolean;
  capacity?: number | null;
  size?: string | null;
  entry_fee_excluded?: boolean | null;
  image_url?: string | null;
  item_order?: number | null;
};
