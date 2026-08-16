import type { PicnicArea } from "./types";

export const samplePicnicAreas: PicnicArea[] = [
  {
    id: "sample-area-1",
    name: "Sample Picnic Area 1",
    description: "A flexible outdoor area suitable for small to medium family groups.",
    capacity: 10,
    price: 0,
    image: "/",
    features: ["Shade", "Family-friendly", "Open grass area"],
    isSample: true,
  },
  {
    id: "sample-area-2",
    name: "Sample Picnic Area 2",
    description: "A more spacious area for larger family gatherings and relaxed picnic time.",
    capacity: 16,
    price: 0,
    image: "/",
    features: ["Open space", "Picnic seating", "View of the farm"],
    isSample: true,
  },
  {
    id: "sample-area-3",
    name: "Sample Picnic Area 3",
    description: "A shaded, enjoyable setting for families wanting a calm picnic break.",
    capacity: 8,
    price: 0,
    image: "/",
    features: ["Shaded", "Quiet area", "Easy access"],
    isSample: true,
  },
];
