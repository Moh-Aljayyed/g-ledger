import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://g-ledger.com";

  return [
    { url: `${baseUrl}/ar`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/ar/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/ar/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/en`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
  ];
}
