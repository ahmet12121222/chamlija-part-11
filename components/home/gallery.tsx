"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { GALLERY_IMAGES } from "@/lib/media/chamlija-images";

export function Gallery() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const syncViewport = () => setIsMobile(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    if (!isMobile || !scrollRef.current) return;

    const firstChild = scrollRef.current.querySelector<HTMLElement>("[data-gallery-card]");
    if (!firstChild) return;

    const gap = 24;
    setCardWidth(firstChild.offsetWidth + gap);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setActiveIndex((previous) => Math.min(Math.max(previous, 0), GALLERY_IMAGES.length - 1));
    }
  }, [isMobile]);

  const updateScrollState = () => {
    const container = scrollRef.current;
    if (!container) return;

    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    setCanScrollLeft(container.scrollLeft > 8);
    setCanScrollRight(container.scrollLeft < maxScrollLeft - 8);
  };

  const goToIndex = (index: number) => {
    const boundedIndex = Math.max(0, Math.min(index, GALLERY_IMAGES.length - 1));
    setActiveIndex(boundedIndex);
  };

  const scrollGallery = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    const firstChild = container.querySelector<HTMLElement>("[data-gallery-card]");
    const cardWidth = firstChild ? firstChild.offsetWidth + 24 : 340;
    container.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
    requestAnimationFrame(updateScrollState);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const delta = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(delta) <= 40) return;

    if (isMobile) {
      if (delta < 0) {
        goToIndex(activeIndex + 1);
      } else {
        goToIndex(activeIndex - 1);
      }
      return;
    }

    scrollGallery(delta < 0 ? "right" : "left");
  };

  const translateX = isMobile ? -(activeIndex * cardWidth) : 0;

  return (
    <section id="gallery" className="scroll-mt-24 bg-gradient-to-b from-[#f7f4ee] via-[#f2ede3] to-[#eae5d8] px-4 py-16 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-[#7a8462] sm:text-xs">Galeri</p>
            <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#14251d] sm:text-4xl">
              Chamlija’dan bir bakış
            </h2>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <button
              type="button"
              aria-label="Previous gallery images"
              onClick={() => scrollGallery("left")}
              disabled={!canScrollLeft}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#14251d]/15 bg-white text-lg text-[#14251d] shadow-[0_8px_16px_rgba(20,37,29,0.06)] transition hover:border-[#14251d]/30 hover:bg-[#f7f4ee] disabled:cursor-not-allowed disabled:opacity-40"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next gallery images"
              onClick={() => scrollGallery("right")}
              disabled={!canScrollRight}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#14251d]/15 bg-white text-lg text-[#14251d] shadow-[0_8px_16px_rgba(20,37,29,0.06)] transition hover:border-[#14251d]/30 hover:bg-[#f7f4ee] disabled:cursor-not-allowed disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl">
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`mt-10 ${isMobile ? "overflow-hidden" : "overflow-x-auto"} pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
        >
          <div
            className={`flex ${isMobile ? "gap-6" : "snap-x snap-mandatory gap-6"}`}
            style={isMobile ? { transform: `translate3d(${translateX}px, 0, 0)`, transition: "transform 240ms ease-out" } : undefined}
          >
            {GALLERY_IMAGES.map((image) => (
              <div
                key={image.id}
                data-gallery-card
                className={`group relative shrink-0 ${isMobile ? "min-w-[82vw]" : "min-w-[82vw] snap-center sm:min-w-[32%]"}`}
              >
                <div className="relative h-[24rem] w-full overflow-hidden sm:h-[28rem]" style={{
                  clipPath: "polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)",
                }}>
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 82vw, (max-width: 1024px) 42vw, 32vw"
                    style={{ objectPosition: "center" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
