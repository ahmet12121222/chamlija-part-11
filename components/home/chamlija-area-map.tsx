"use client";

import { useState } from "react";

import { AREA_CAPACITIES } from "@/lib/business-rules/areas";
import { VERIFIED_CHAMLIJA_FACTS } from "@/lib/chamlija/verified-facts";

type AreaItem = {
  id: string;
  name: string;
  category: string;
  price?: string;
  capacity?: string;
  description: string;
  available: "Free" | "Paid";
};

const areaItems: AreaItem[] = [
  {
    id: "braai-areas",
    name: "Braai Areas",
    category: "Picnic areas",
    price: `R${VERIFIED_CHAMLIJA_FACTS.picnicAreas.find((area) => area.name === "Braai Area")?.price ?? 350}`,
    capacity: "Units 1-6: 10-15 adults",
    description: "Bookable braai units for outdoor gatherings.",
    available: "Paid",
  },
  {
    id: "ottoman-corner",
    name: "Ottoman Corner",
    category: "Picnic areas",
    price: `R${VERIFIED_CHAMLIJA_FACTS.picnicAreas.find((area) => area.name === "Ottoman Corner")?.price ?? 1500}`,
    capacity: `${AREA_CAPACITIES.ottoman_area.maxCapacity} people`,
    description: "A smaller, dedicated picnic corner.",
    available: "Paid",
  },
  {
    id: "grass-area",
    name: "Grass Area",
    category: "Picnic areas",
    price: `R${VERIFIED_CHAMLIJA_FACTS.picnicAreas.find((area) => area.name === "Grass Area")?.price ?? 5500}`,
    capacity: `${AREA_CAPACITIES.grass_area_next_to_barn.maxCapacity} people`,
    description: "Open grass space for larger outdoor gatherings.",
    available: "Paid",
  },
  {
    id: "grass-area-tent",
    name: "Grass Area with Tent",
    category: "Picnic areas",
    price: `R${VERIFIED_CHAMLIJA_FACTS.picnicAreas.find((area) => area.name.includes("Tent"))?.price ?? 10000}`,
    description: "Grass area with a 9x16m tent.",
    available: "Paid",
  },
  { id: "animal-viewing", name: "Animal Viewing", category: "Activities", description: "See Chamlija's verified range of animals.", available: "Free" },
  { id: "yellow-wood", name: "Yellow Wood Play Park", category: "Activities", description: "A free play area for children.", available: "Free" },
  { id: "bike-riding", name: "Bike Riding", category: "Activities", description: "Free outdoor cycling activity.", available: "Free" },
  { id: "basketball", name: "Basketball", category: "Activities", description: "Free activity; bring your own equipment.", available: "Free" },
  { id: "cricket", name: "Cricket", category: "Activities", description: "Free activity; bring your own equipment.", available: "Free" },
  { id: "beach-volleyball", name: "Beach Volleyball", category: "Activities", description: "Free activity; bring your own equipment.", available: "Free" },
  { id: "mini-golf", name: "Mini Golf", category: "Activities", description: "Free activity; bring your own equipment.", available: "Free" },
  { id: "jumping-castle", name: "Jumping Castle", category: "Activities", description: "A free family activity.", available: "Free" },
  { id: "nature", name: "Nature & Open Areas", category: "Activities", description: "Open areas for walking and enjoying the landscape.", available: "Free" },
  { id: "ox-wagon", name: "OX Wagon Tour", category: "Experiences", price: "R60 adult / R50 child", description: "A paid guided experience through the area.", available: "Paid" },
];

const categories = ["All", "Picnic areas", "Activities", "Experiences"];

export function ChamlijaAreaMap() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedArea, setSelectedArea] = useState<AreaItem>(areaItems[0]);
  const visibleAreas = activeCategory === "All" ? areaItems : areaItems.filter((area) => area.category === activeCategory);

  return (
    <section className="hidden border-y border-forest/10 bg-[#eef1e5] px-4 py-16 sm:px-6 md:block lg:px-8 lg:py-24" aria-labelledby="chamlija-area-map-title">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-terracotta">Explore Chamlija</p>
          <h2 id="chamlija-area-map-title" className="mt-3 text-3xl font-black tracking-tight text-forest sm:text-4xl">Find your place in the park</h2>
          <p className="mt-4 text-base leading-7 text-charcoal/70">Explore the verified Chamlija areas and activities. Select any point to see the available details.</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Chamlija area categories">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={activeCategory === category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${activeCategory === category ? "border-forest bg-forest text-white" : "border-forest/15 bg-white/70 text-forest hover:bg-white"}`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="relative overflow-hidden rounded-[2rem] border border-forest/10 bg-[#dfe8d7] p-4 shadow-[0_18px_45px_rgba(25,53,42,0.08)] sm:p-6">
            <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
              <div className="absolute -left-10 top-10 h-44 w-44 rounded-full border-[20px] border-[#c6d8be]" />
              <div className="absolute right-8 top-16 h-36 w-64 rotate-12 rounded-[50%] border-[18px] border-[#c6d8be]" />
              <div className="absolute bottom-8 left-1/3 h-28 w-72 -rotate-6 rounded-[50%] border-[16px] border-[#c6d8be]" />
            </div>
            <div className="relative grid gap-3 sm:grid-cols-2">
              {visibleAreas.map((area, index) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => setSelectedArea(area)}
                  className={`group min-h-24 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${selectedArea.id === area.id ? "border-terracotta bg-white shadow-md" : "border-forest/10 bg-white/80"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-black text-white">{String(index + 1).padStart(2, "0")}</span>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${area.available === "Free" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{area.available}</span>
                  </div>
                  <div className="mt-3 font-bold text-forest">{area.name}</div>
                  <div className="mt-1 text-xs text-charcoal/60">{area.category}</div>
                </button>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-forest/10 bg-white p-6 shadow-[0_18px_45px_rgba(25,53,42,0.06)]" aria-live="polite">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-forest">Area details</span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${selectedArea.available === "Free" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{selectedArea.available}</span>
            </div>
            <h3 className="mt-6 text-2xl font-black text-forest">{selectedArea.name}</h3>
            <p className="mt-3 text-sm leading-6 text-charcoal/70">{selectedArea.description}</p>
            <dl className="mt-6 space-y-3 border-t border-forest/10 pt-5 text-sm">
              {selectedArea.price && <div className="flex items-center justify-between gap-4"><dt className="text-charcoal/60">Price</dt><dd className="font-bold text-forest">{selectedArea.price}</dd></div>}
              {selectedArea.capacity && <div className="flex items-center justify-between gap-4"><dt className="text-charcoal/60">Capacity</dt><dd className="text-right font-bold text-forest">{selectedArea.capacity}</dd></div>}
              {!selectedArea.price && <div className="flex items-center justify-between gap-4"><dt className="text-charcoal/60">Activity fee</dt><dd className="font-bold text-forest">Free</dd></div>}
            </dl>
          </aside>
        </div>
      </div>
    </section>
  );
}
