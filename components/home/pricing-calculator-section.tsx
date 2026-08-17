"use client";

import PriceCalculator from "@/components/site/price-calculator";
import { useLanguage } from "@/components/site/language-provider";

export function PricingCalculatorSection() {
  const { t } = useLanguage();
  
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-amber-50 via-white to-amber-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-amber-600 text-sm font-bold tracking-wide uppercase mb-2">
            💰 {t("priceCalculator.title", "Price Calculator")}
          </div>
          <h2 className="text-4xl font-bold text-amber-900 mb-4">
            Plan Your Budget
          </h2>
          <p className="text-lg text-amber-800 max-w-2xl mx-auto">
            Use our interactive price calculator to explore different combinations of activities and services. See exactly what your visit will cost before you book.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <PriceCalculator />
        </div>

        <div className="mt-8 text-center text-sm text-amber-700">
          <p className="italic">
            {t("priceCalculator.estimateNote", "This is an estimate. Final pricing can be confirmed during reservation.")}
          </p>
        </div>
      </div>
    </section>
  );
}
