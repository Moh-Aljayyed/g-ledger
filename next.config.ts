import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // Don't 308-redirect trailing slashes — Raqyy webhook integration POSTs to
  // /api/v1/integrations/raqyy/{ping,sales-invoices,stock-movements}/ with a
  // trailing slash, and browser CORS preflights cannot follow redirects.
  skipTrailingSlashRedirect: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default withNextIntl(nextConfig);
