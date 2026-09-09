import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/atoms/landing-page";
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
const title = "Shadowy - neredzamā darba un komandas slodzes pārskats";
const description =
  "Redziet komandas neredzamo darbu, fokusa zudumu un to, kuri klienti izmaksā visdārgāk. Shadowy ir darba slodzes pārskatāmības rīks - bez darbinieku novērošanas. 30 dienu bezmaksas pilots.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
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

export default function HomePage() {
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
      <LandingPage />
    </>
  );
}
