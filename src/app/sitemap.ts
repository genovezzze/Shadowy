import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

/**
 * Only pages that are indexable, canonical and worth a click from a search
 * result belong here. `/login` was dropped: it is a bare form with no content to
 * rank, and listing it spends crawl attention that the marketing pages want.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/pilotprojekts`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/projekti/pb-finanses`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/register`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
