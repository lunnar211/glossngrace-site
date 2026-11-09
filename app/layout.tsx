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

export const metadata: Metadata = {
  title: "GlossnGrace Nails",
  description:
    "GlossnGrace Nails — careful manicures, gel, acrylics, nail art and bridal nails. Book your appointment online in under a minute.",
  openGraph: {
    title: "GlossnGrace Nails",
    description: "Nails, but make it graceful. Book your appointment online.",
    type: "website",
    siteName: "GlossnGrace Nails",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ivory font-sans text-plum">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
