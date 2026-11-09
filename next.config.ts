import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Cache Components removed (was: cacheComponents + partialPrefetching).
     With it on, the auth-gated /admin route (cookies() outside Suspense)
     fails the production build at prerender time. Public pages still
     prerender statically by default; /admin renders dynamically per
     request, which is correct for a login-gated page. */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
