import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { BackToTop } from "@/components/site/back-to-top";
import { NoCopyGuard } from "@/components/site/no-copy-guard";
import { Hero } from "@/components/home/hero";
import { AboutSection } from "@/components/home/about-section";
import { ExperienceCategories } from "@/components/home/experience-categories";
import { PopularOptions } from "@/components/home/popular-options";
import { FreeActivities } from "@/components/home/free-activities";
import { Gallery } from "@/components/home/gallery";
import { WeatherWidget } from "@/components/home/weather-widget";
import { WhyChamlija } from "@/components/home/why-chamlija";
import { FinalCta } from "@/components/home/final-cta";
import { getProducts } from "@/lib/products/service";

// Always fetch the latest Supabase catalog for pricing — never cache/prerender stale prices.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { products } = await getProducts();

  return (
    <NoCopyGuard>
      <SiteHeader />
      <main className="flex-1 bg-background text-foreground">
        <Hero />
        <AboutSection />
        <ExperienceCategories />
        <PopularOptions products={products} />
        <FreeActivities products={products} />
        <Gallery />
        <WeatherWidget />
        <WhyChamlija />
        <FinalCta />
      </main>
      <SiteFooter />
      <BackToTop />
    </NoCopyGuard>
  );
}
