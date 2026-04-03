import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://g-ledger.com";
  const now = new Date();

  return [
    // Landing pages
    { url: `${baseUrl}/ar`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/en`, lastModified: now, changeFrequency: "daily", priority: 0.9 },

    // Auth
    { url: `${baseUrl}/ar/register`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/ar/login`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/en/register`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/en/login`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },

    // Content
    { url: `${baseUrl}/ar/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/en/blog`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/ar/api-docs`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/en/api-docs`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },

    // Legal
    { url: `${baseUrl}/ar/legal/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/ar/legal/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/ar/legal/sla`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },

    // RSS
    { url: `${baseUrl}/rss.xml`, lastModified: now, changeFrequency: "daily", priority: 0.5 },
  ];
}
