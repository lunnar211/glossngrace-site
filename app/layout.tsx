import type { Metadata } from "next";
import { Playfair_Display, Jost } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/site-chrome";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const SITE_URL = "https://glossngrace-site.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "GlossnGrace Nails",
  description:
    "GlossnGrace Nails — careful manicures, gel, acrylics, nail art and bridal nails. Book your appointment online in under a minute.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "GlossnGrace Nails",
    description: "Nails, but make it graceful. Book your appointment online.",
    type: "website",
    siteName: "GlossnGrace Nails",
    url: SITE_URL,
    images: [{ url: "/images/hero.webp", width: 1200, height: 800, alt: "Hands with blush pink nails and gold foil tips" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GlossnGrace Nails",
    description: "Nails, but make it graceful. Book your appointment online.",
    images: ["/images/hero.webp"],
  },
};

// Minimal NailSalon structured data — name + URL only. No address,
// hours, phone or geo until the owner supplies them; never invented.
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "NailSalon",
  name: "GlossnGrace Nails",
  url: SITE_URL,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ivory font-sans text-plum">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
