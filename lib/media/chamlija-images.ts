// Centralized image configuration for the homepage. The real Chamlija photography lives in
// public/chamlija and is intentionally managed from this single source so local image updates
// stay easy and the rest of the site remains unchanged.
export type ChamlijaImage = {
  id: string;
  src: string;
  alt: string;
};

const FALLBACK_IMAGE = "/chamlija/20.jpg";

const EXPLICIT_PRODUCT_IMAGE_MAP: Record<string, string> = {
  "White Swan & Heart-Shaped Pool": "/chamlija/8.jpg",
  "Picnic & BBQ Area": "/chamlija/9.jpg",
  "Picnic - Braai Area": "/chamlija/9.jpg",
  "Ottoman Corner": "/chamlija/osmanli-new.jpg",
  "6-Person Picnic Table & Bench": "/chamlija/11.jpg",
  "6-Seater Picnic Table - Bench": "/chamlija/11.jpg",
  "Plastic Table": "/chamlija/12.jpg",
  "Plastic Chair": "/chamlija/plastiksandalye-new.jpg",
};

export const HERO_IMAGES: ChamlijaImage[] = [
  {
    id: "hero-main",
    src: "/chamlija/1.jpg",
    alt: "Wide Chamlija landscape with picnic lawns and shaded outdoor spaces",
  },
  {
    id: "hero-secondary",
    src: "/chamlija/2.jpg",
    alt: "Open family picnic area at Chamlija in natural surroundings",
  },
];

export const ABOUT_IMAGES: ChamlijaImage[] = [
  {
    id: "about-1",
    src: "/chamlija/2.jpg",
    alt: "Chamlija picnic and outdoor seating area with greenery",
  },
  {
    id: "about-2",
    src: "/chamlija/3.jpg",
    alt: "A wide Chamlija outdoor area with open lawn and event tents",
  },
];

export const CATEGORY_IMAGES: Record<string, ChamlijaImage> = {
  picnic_area: {
    id: "category-picnic-area",
    src: "/chamlija/3.jpg",
    alt: "Picnic area with a natural grass lawn and shady seating at Chamlija",
  },
  tent_event_area: {
    id: "category-tent-event-area",
    src: "/chamlija/5.jpg",
    alt: "Chamlija event tent set up on the lawn",
  },
  paid_activity: {
    id: "category-paid-activity",
    src: "/chamlija/6.jpg",
    alt: "Guests enjoying a Chamlija activity in the outdoor setting",
  },
  photo_shoot: {
    id: "category-photo-shoot",
    src: "/chamlija/7.jpg",
    alt: "Scenic Chamlija location used for outdoor photos and portraits",
  },
};

export const GALLERY_IMAGES: ChamlijaImage[] = [
  { id: "gallery-1", src: "/chamlija/14.jpg", alt: "Chamlija gallery view 1" },
  { id: "gallery-2", src: "/chamlija/15.jpg", alt: "Chamlija gallery view 2" },
  { id: "gallery-3", src: "/chamlija/16.jpg", alt: "Chamlija gallery view 3" },
  { id: "gallery-4", src: "/chamlija/17.jpg", alt: "Chamlija gallery view 4" },
  { id: "gallery-5", src: "/chamlija/18.jpg", alt: "Chamlija gallery view 5" },
  { id: "gallery-6", src: "/chamlija/19.jpg", alt: "Chamlija gallery view 6" },
  { id: "gallery-7", src: "/chamlija/20.jpg", alt: "Chamlija gallery view 7" },
];

export const FINAL_CTA_IMAGE: ChamlijaImage = {
  id: "final-cta",
  src: "/chamlija/20.jpg",
  alt: "Wide Chamlija outdoor scenery at golden hour",
};

export function getProductImage(product: { image_url?: string | null; category: string; name: string }): ChamlijaImage {
  const explicit = EXPLICIT_PRODUCT_IMAGE_MAP[product.name];
  if (explicit) {
    return { id: `product-${product.name}`, src: explicit, alt: product.name };
  }

  if (product.image_url) {
    return { id: `product-${product.name}`, src: product.image_url, alt: product.name };
  }

  return CATEGORY_IMAGES[product.category] ?? { id: "product-fallback", src: FALLBACK_IMAGE, alt: product.name };
}
