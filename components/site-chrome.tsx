"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

/**
 * Public site chrome (header, footer, sticky mobile "Book Now" bar).
 * The admin panel (/admin) is a private dashboard — it must NOT show the
 * public navigation or the Book Now button, otherwise tapping Book Now
 * yanks the admin out to the public booking page.
 */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <SiteFooter />
      {/* Sticky mobile Book Now bar */}
      <a
        href="/book"
        aria-label="Book now"
        className="fixed inset-x-0 bottom-0 z-40 flex min-h-[56px] items-center justify-center bg-gold text-base font-semibold tracking-wide text-white md:hidden"
      >
        Book Now
      </a>
    </>
  );
}
