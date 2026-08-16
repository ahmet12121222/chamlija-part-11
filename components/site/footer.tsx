import Link from "next/link";

// Placeholder contact details — replace with the real Chamlija phone, email and address.
const CONTACT = {
  phone: "+27 00 000 0000",
  whatsapp: "+27 00 000 0000",
  email: "info@chamlija.co.za",
  address: "Chamlija Nature Grounds, South Africa",
};

const QUICK_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Experiences", href: "#experiences" },
  { label: "Gallery", href: "#gallery" },
];

export function SiteFooter() {
  return (
    <footer id="contact" className="scroll-mt-24 border-t border-olive/20 bg-forest-dark text-white/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-8 md:grid-cols-2 md:gap-12 lg:grid-cols-4 lg:px-10 lg:py-20">
        <div>
          <p className="text-lg font-bold uppercase tracking-[0.3em] text-white">Chamlija</p>
          <p className="mt-4 text-sm leading-7 text-white/55">
            A premium nature destination for picnics, family days, celebrations and outdoor activities.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Quick Links</p>
          <ul className="mt-5 space-y-3 text-sm">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition hover:text-terracotta">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Booking</p>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link href="/book" className="transition hover:text-terracotta">
                Book Your Visit
              </Link>
            </li>
            <li className="text-white/55">Open daily: 09:00 – 18:00</li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Contact</p>
          <ul className="mt-5 space-y-3 text-sm text-white/55">
            <li>{CONTACT.address}</li>
            <li>
              <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="transition hover:text-terracotta">
                {CONTACT.phone}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${CONTACT.whatsapp.replace(/[^\d]/g, "")}`}
                className="transition hover:text-terracotta"
              >
                WhatsApp us
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT.email}`} className="transition hover:text-terracotta">
                {CONTACT.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-white/40 sm:px-8 lg:px-10">
          © {new Date().getFullYear()} Buyuk Chamlija. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
