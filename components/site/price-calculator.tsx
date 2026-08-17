"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "./language-provider";

const PRICES = {
  entrance: { adult: 50, child: 25, under3: 0 },
  activities: {
    animalFeeding: { adult: 30, child: 30 },
    oxWagon: { adult: 60, child: 50 },
  },
  picnicAreas: {
    grassArea: { size2: 150, size4: 250, size6: 350 },
    eventSpace: { size10: 500, size20: 900 },
  },
};

type PricingBreakdown = {
  entrance: number;
  activities: number;
  picnicArea: number;
  subtotal: number;
  total: number;
};

export default function PriceCalculator() {
  const { t, language } = useLanguage();
  const [adults, setAdults] = useState(1);
  const [children3Plus, setChildren3Plus] = useState(0);
  const [childrenUnder3, setChildrenUnder3] = useState(0);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedPicnicArea, setSelectedPicnicArea] = useState<string | null>(
    null
  );

  const pricing: PricingBreakdown = useMemo(() => {
    const entrance =
      adults * PRICES.entrance.adult +
      children3Plus * PRICES.entrance.child +
      childrenUnder3 * PRICES.entrance.under3;

    let activities = 0;
    if (selectedActivities.includes("animalFeeding")) {
      activities +=
        (adults + children3Plus) * PRICES.activities.animalFeeding.adult;
    }
    if (selectedActivities.includes("oxWagon")) {
      activities +=
        adults * PRICES.activities.oxWagon.adult +
        children3Plus * PRICES.activities.oxWagon.child;
    }

    let picnicArea = 0;
    if (selectedPicnicArea === "grass2") picnicArea = PRICES.picnicAreas.grassArea.size2;
    if (selectedPicnicArea === "grass4") picnicArea = PRICES.picnicAreas.grassArea.size4;
    if (selectedPicnicArea === "grass6") picnicArea = PRICES.picnicAreas.grassArea.size6;
    if (selectedPicnicArea === "event10") picnicArea = PRICES.picnicAreas.eventSpace.size10;
    if (selectedPicnicArea === "event20") picnicArea = PRICES.picnicAreas.eventSpace.size20;

    const subtotal = entrance + activities + picnicArea;
    const total = subtotal;

    return {
      entrance,
      activities,
      picnicArea,
      subtotal,
      total,
    };
  }, [adults, children3Plus, childrenUnder3, selectedActivities, selectedPicnicArea]);

  const toggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };

  const calcLabel =
    language === "tr"
      ? "Fiyat Hesaplayıcı"
      : language === "af"
        ? "Pryskalkulator"
        : language === "zu"
          ? "Isibali Senani"
          : language === "xh"
            ? "Isibali Senani"
            : t("priceCalculator.title", "Price Calculator");

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-amber-900">
        {calcLabel}
      </h2>

      {/* Entry Section */}
      <div className="mb-6 pb-6 border-b border-amber-200">
        <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
          🎫 {t("priceCalculator.entranceTitle", "Entry")}
        </h3>

        <div className="space-y-4">
          {/* Adults */}
          <div className="flex items-center justify-between bg-amber-50 p-4 rounded">
            <div>
              <label className="block font-medium text-amber-900">
                {t("priceCalculator.adultsLabel", "Adults")}
              </label>
              <span className="text-sm text-amber-700">
                ZAR {PRICES.entrance.adult} {t("priceCalculator.perPerson", "per person")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAdults(Math.max(0, adults - 1))}
                className="px-3 py-1 bg-amber-200 hover:bg-amber-300 rounded text-amber-900 font-bold"
              >
                −
              </button>
              <span className="w-8 text-center font-bold text-amber-900">
                {adults}
              </span>
              <button
                onClick={() => setAdults(adults + 1)}
                className="px-3 py-1 bg-amber-200 hover:bg-amber-300 rounded text-amber-900 font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Children 3+ */}
          <div className="flex items-center justify-between bg-amber-50 p-4 rounded">
            <div>
              <label className="block font-medium text-amber-900">
                {t("priceCalculator.childrenLabel", "Children (3+)")}
              </label>
              <span className="text-sm text-amber-700">
                ZAR {PRICES.entrance.child} {t("priceCalculator.perPerson", "per person")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChildren3Plus(Math.max(0, children3Plus - 1))}
                className="px-3 py-1 bg-amber-200 hover:bg-amber-300 rounded text-amber-900 font-bold"
              >
                −
              </button>
              <span className="w-8 text-center font-bold text-amber-900">
                {children3Plus}
              </span>
              <button
                onClick={() => setChildren3Plus(children3Plus + 1)}
                className="px-3 py-1 bg-amber-200 hover:bg-amber-300 rounded text-amber-900 font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Under 3 */}
          <div className="flex items-center justify-between bg-green-50 p-4 rounded">
            <div>
              <label className="block font-medium text-green-900">
                {t("priceCalculator.under3Label", "Under 3 (Free)")}
              </label>
              <span className="text-sm text-green-700">
                {t("priceCalculator.free", "FREE")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChildrenUnder3(Math.max(0, childrenUnder3 - 1))}
                className="px-3 py-1 bg-green-200 hover:bg-green-300 rounded text-green-900 font-bold"
              >
                −
              </button>
              <span className="w-8 text-center font-bold text-green-900">
                {childrenUnder3}
              </span>
              <button
                onClick={() => setChildrenUnder3(childrenUnder3 + 1)}
                className="px-3 py-1 bg-green-200 hover:bg-green-300 rounded text-green-900 font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Entry Subtotal */}
          <div className="bg-amber-100 p-4 rounded font-semibold text-amber-900 text-right">
            Entry: ZAR {pricing.entrance.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Activities Section */}
      <div className="mb-6 pb-6 border-b border-amber-200">
        <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
          ✨ {t("priceCalculator.extrasTitle", "Extras & Activities")}
        </h3>

        <p className="text-sm text-amber-700 mb-4">
          {t("priceCalculator.selectAddOns", "Select add-ons")}
        </p>

        <div className="space-y-3">
          {/* Animal Feeding */}
          <label className="flex items-center p-3 border border-amber-200 rounded cursor-pointer hover:bg-amber-50">
            <input
              type="checkbox"
              checked={selectedActivities.includes("animalFeeding")}
              onChange={() => toggleActivity("animalFeeding")}
              className="w-5 h-5 text-amber-600 rounded"
            />
            <div className="ml-3 flex-1">
              <div className="font-medium text-amber-900">🥕 Animal Feeding</div>
              <div className="text-sm text-amber-700">
                ZAR {PRICES.activities.animalFeeding.adult} per person
              </div>
            </div>
          </label>

          {/* OX Wagon */}
          <label className="flex items-center p-3 border border-amber-200 rounded cursor-pointer hover:bg-amber-50">
            <input
              type="checkbox"
              checked={selectedActivities.includes("oxWagon")}
              onChange={() => toggleActivity("oxWagon")}
              className="w-5 h-5 text-amber-600 rounded"
            />
            <div className="ml-3 flex-1">
              <div className="font-medium text-amber-900">🚜 OX Wagon Tour</div>
              <div className="text-sm text-amber-700">
                ZAR {PRICES.activities.oxWagon.adult} adult / ZAR{" "}
                {PRICES.activities.oxWagon.child} child
              </div>
            </div>
          </label>

          {pricing.activities > 0 && (
            <div className="bg-blue-50 p-3 rounded text-right font-semibold text-blue-900">
              Activities: ZAR {pricing.activities.toFixed(0)}
            </div>
          )}
        </div>
      </div>

      {/* Picnic Areas Section */}
      <div className="mb-6 pb-6 border-b border-amber-200">
        <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
          🧺 {t("priceCalculator.picnicAreasTitle", "Picnic Areas")}
        </h3>

        <div className="space-y-3">
          <label className="flex items-center p-3 border border-amber-200 rounded cursor-pointer hover:bg-amber-50">
            <input
              type="radio"
              name="picnicArea"
              checked={selectedPicnicArea === null}
              onChange={() => setSelectedPicnicArea(null)}
              className="w-5 h-5 text-amber-600"
            />
            <div className="ml-3 flex-1">
              <div className="font-medium text-amber-900">None</div>
            </div>
          </label>

          <label className="flex items-center p-3 border border-amber-200 rounded cursor-pointer hover:bg-amber-50">
            <input
              type="radio"
              name="picnicArea"
              checked={selectedPicnicArea === "grass2"}
              onChange={() => setSelectedPicnicArea("grass2")}
              className="w-5 h-5 text-amber-600"
            />
            <div className="ml-3 flex-1">
              <div className="font-medium text-amber-900">Grass Area (2-3 people)</div>
              <div className="text-sm text-amber-700">ZAR 150</div>
            </div>
          </label>

          <label className="flex items-center p-3 border border-amber-200 rounded cursor-pointer hover:bg-amber-50">
            <input
              type="radio"
              name="picnicArea"
              checked={selectedPicnicArea === "grass4"}
              onChange={() => setSelectedPicnicArea("grass4")}
              className="w-5 h-5 text-amber-600"
            />
            <div className="ml-3 flex-1">
              <div className="font-medium text-amber-900">Grass Area (4-5 people)</div>
              <div className="text-sm text-amber-700">ZAR 250</div>
            </div>
          </label>

          <label className="flex items-center p-3 border border-amber-200 rounded cursor-pointer hover:bg-amber-50">
            <input
              type="radio"
              name="picnicArea"
              checked={selectedPicnicArea === "grass6"}
              onChange={() => setSelectedPicnicArea("grass6")}
              className="w-5 h-5 text-amber-600"
            />
            <div className="ml-3 flex-1">
              <div className="font-medium text-amber-900">Grass Area (6+ people)</div>
              <div className="text-sm text-amber-700">ZAR 350</div>
            </div>
          </label>

          {pricing.picnicArea > 0 && (
            <div className="bg-purple-50 p-3 rounded text-right font-semibold text-purple-900">
              Picnic Area: ZAR {pricing.picnicArea.toFixed(0)}
            </div>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="bg-gradient-to-r from-amber-100 to-amber-50 p-6 rounded-lg">
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-amber-900">Entry:</span>
            <span className="font-semibold text-amber-900">ZAR {pricing.entrance.toFixed(0)}</span>
          </div>
          {pricing.activities > 0 && (
            <div className="flex justify-between mb-2">
              <span className="text-amber-900">Activities:</span>
              <span className="font-semibold text-amber-900">ZAR {pricing.activities.toFixed(0)}</span>
            </div>
          )}
          {pricing.picnicArea > 0 && (
            <div className="flex justify-between mb-2">
              <span className="text-amber-900">Picnic Area:</span>
              <span className="font-semibold text-amber-900">ZAR {pricing.picnicArea.toFixed(0)}</span>
            </div>
          )}
        </div>

        <div className="border-t border-amber-300 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-amber-900">
              {t("priceCalculator.total", "Total")}:
            </span>
            <span className="text-3xl font-bold text-amber-900">
              ZAR {pricing.total.toFixed(0)}
            </span>
          </div>
        </div>

        <p className="text-xs text-amber-700 mt-4 italic">
          {t("priceCalculator.estimateNote", "This is an estimate. Final pricing can be confirmed during reservation.")}
        </p>
      </div>
    </div>
  );
}
