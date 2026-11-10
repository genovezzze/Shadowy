import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/atoms/landing-page";
import { getPilotStats } from "@/lib/pilot-stats";
import {
  JsonLd,
  faqPageNode,
  organizationNode,
  softwareApplicationNode,
  websiteNode,
} from "@/lib/structured-data";

// The homepage used to title itself `absolute: "Shadowy"` - a single brand word,
// which can only ever rank for people already searching the brand. The title now
// leads with what the product is, so the page has something to match against for
// the queries a company actually types before it has heard of us.
// Brand first, description after. The page has to answer two different queries:
// someone searching the problem, and someone searching "shadowy" who is trying
// to find *this* company. Leading with the description served the first and
// buried the second - and the brand query is the one that was failing.
const title = "Shadowy: cik patiesībā izmaksā katrs grāmatvedības klients";
const description =
  "Shadowy rāda grāmatvedības birojam, cik stundu un naudas aiziet katram klientam un kāpēc. Ieraksts 30 sekundēs, bez novērošanas. 30 dienu bezmaksas pilots.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: "/",
    languages: { lv: "/", en: "/en", "x-default": "/" },
  },
  // Next.js replaces the whole `openGraph` object when a page declares one, so
  // omitting `images` here did not fall back to the root layout's - it left the
  // homepage with no share image at all. Every field it needs is repeated.
  openGraph: {
    type: "website",
    locale: "lv_LV",
    url: "/",
    siteName: "Shadowy",
    title,
    description,
    images: [
      {
        url: "/images/shadowy-dashboard-wide.png",
        width: 1916,
        height: 821,
        alt: "Shadowy darba slodzes pārskats",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/shadowy-dashboard-wide.png"],
  },
};

// The pilot figures in "Kam Shadowy noder" are recomputed once a day.
export const revalidate = 86400;

export default async function HomePage() {
  const pilotStats = await getPilotStats();
  return (
    <>
      <JsonLd
        nodes={[
          organizationNode,
          websiteNode,
          softwareApplicationNode,
          faqPageNode,
        ]}
      />
      <LandingPage forcedLocale="lv" pilotStats={pilotStats} />
    </>
  );
}
