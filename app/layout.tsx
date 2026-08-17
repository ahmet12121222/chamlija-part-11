import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DecorativeLeaves } from "@/components/DecorativeLeaves";
import { ChamlijaAIChat } from "@/components/site/chamlija-ai-chat";
import { LanguageProvider } from "@/components/site/language-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Buyuk Chamlija | Escape to Nature",
  description:
    "Book your picnic area, tent or event space, activities and photo shoots at Buyuk Chamlija — a premium nature destination for family days out.",
  icons: {
    icon: "/logo/logo-mark.png",
    shortcut: "/logo/logo-mark.png",
    apple: "/logo/logo-mark.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col font-sans" style={{ isolation: "isolate" }}>
        <LanguageProvider>
          <DecorativeLeaves />
          <div className="site-content-shell">{children}</div>
          <ChamlijaAIChat />
        </LanguageProvider>
      </body>
    </html>
  );
}
