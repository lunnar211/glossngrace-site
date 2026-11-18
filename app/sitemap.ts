import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/services";

const SITE_URL = "https://glossngrace-site.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/services", "/book", "/gallery", "/about"].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: new Date(),
  }));
  const services = SERVICES.map((s) => ({
    url: `${SITE_URL}/services/${s.slug}`,
    lastModified: new Date(),
  }));
  return [...pages, ...services];
}
