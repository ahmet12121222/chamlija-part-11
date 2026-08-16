"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Experiences", href: "#experiences" },
  { label: "Gallery", href: "#gallery" },
  { label: "Pricing", href: "#popular-options" },
  { label: "Contact", href: "#contact" },
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function handleScroll() {
      const currentScrollY = window.scrollY;
      const scrolledDown = currentScrollY > lastScrollY.current;
      const pastThreshold = currentScrollY > 120;

      setIsAtTop(currentScrollY < 48);
      setIsHidden(scrolledDown && pastThreshold);
      lastScrollY.current = currentScrollY;
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Keep the header visible whenever the mobile menu is open, and always visible near the top.
  const hideHeader = isHidden && !isMenuOpen && !isAtTop;
  const transparentMode = isAtTop && !isMenuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        hideHeader ? "-translate-y-full" : "translate-y-0"
      } ${
        transparentMode
          ? "bg-transparent"
          : "bg-[#f6f2ea]/90 shadow-[0_8px_24px_rgba(20,37,29,0.08)] backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full border text-base font-bold transition-colors duration-500 ${
              transparentMode ? "border-white/45 bg-white/10 text-white" : "border-[#19352a]/20 bg-[#19352a] text-[#f4efe5]"
            }`}
          >
            C
          </div>
          <div>
            <p
              className={`text-sm font-semibold uppercase tracking-[0.26em] transition-colors duration-500 ${
                transparentMode ? "text-white" : "text-[#14251d]"
              }`}
            >
              Chamlija
            </p>
          </div>
        </Link>

        <nav
          className={`hidden items-center gap-8 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-500 lg:flex ${
            transparentMode ? "text-white/80" : "text-[#14251d]/80"
          }`}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`relative pb-1 transition hover:opacity-100 ${
                transparentMode ? "hover:text-white" : "hover:text-[#19352a]"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/book"
            className="hidden items-center justify-center rounded-full bg-[#e8e1d4] px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#14251d] shadow-[0_8px_18px_rgba(20,37,29,0.12)] transition hover:bg-white sm:inline-flex"
          >
            Book Now
          </Link>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-500 lg:hidden ${
              transparentMode && !isMenuOpen
                ? "border-white/50 bg-white/10 text-white"
                : "border-[#19352a]/15 bg-white text-[#14251d]"
            }`}
          >
            <span className="sr-only">Toggle navigation</span>
            {isMenuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 top-0 z-40 flex flex-col justify-between bg-forest-dark px-5 pb-8 pt-24 transition-all duration-500 lg:hidden ${
          isMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 overflow-y-auto">
          {NAV_LINKS.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              style={{ transitionDelay: isMenuOpen ? `${index * 40}ms` : "0ms" }}
              className={`border-b border-white/10 py-4 text-xl font-semibold uppercase tracking-[0.08em] text-white/90 transition duration-300 hover:text-terracotta ${
                isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <Link
          href="/book"
          onClick={() => setIsMenuOpen(false)}
          className="mt-8 flex items-center justify-center rounded-full bg-terracotta px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-terracotta/30"
        >
          Book Now
        </Link>
      </div>
    </header>
  );
}
