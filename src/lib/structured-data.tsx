import { getSiteUrl } from "@/lib/site-url";
import { FAQ_ITEMS } from "@/components/landing/atoms/landing-faq-items";

const siteUrl = getSiteUrl();

const ORGANIZATION_ID = `${siteUrl}/#organization`;
const WEBSITE_ID = `${siteUrl}/#website`;

/**
 * The site's entity graph.
 *
 * Everything is emitted as one `@graph` with stable `@id`s rather than as
 * separate loose blocks, so the software product, the FAQ and the pages all
 * resolve to the *same* publisher node instead of Google having to guess that
 * three "Shadowy" mentions are one company. That single resolved entity is what
 * a knowledge panel and an AI citation are built from.
 */
export const organizationNode = {
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: "Shadowy",
  // "Shadowy" on its own is an ordinary English adjective, so the brand has to
  // be pinned to something a search engine can resolve to *this* entity. The
  // alternate names are the forms people actually type, and `sameAs` is the
  // strongest signal available here: a profile Google already knows.
  alternateName: ["Shadowy.lv", "Shadowy Latvija"],
  sameAs: ["https://www.linkedin.com/company/shadowy/"],
  url: siteUrl,
  logo: {
    "@type": "ImageObject",
    url: `${siteUrl}/icon-512.png`,
    width: 512,
    height: 512,
  },
  image: `${siteUrl}/images/shadowy-dashboard-wide.png`,
  email: "contact@shadowy.lv",
  description:
    "Shadowy ir rīks grāmatvedības birojiem, kas parāda katra klienta patieso pašizmaksu: stundas, izmaksas un papildu darba iemeslus.",
  areaServed: { "@type": "Country", name: "Latvia" },
  knowsLanguage: ["lv", "en"],
  contactPoint: [
    {
      "@type": "ContactPoint",
      email: "contact@shadowy.lv",
      contactType: "sales",
      availableLanguage: ["Latvian", "English"],
    },
  ],
} as const;

export const websiteNode = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: siteUrl,
  name: "Shadowy",
  inLanguage: "lv",
  publisher: { "@id": ORGANIZATION_ID },
} as const;

/**
 * The product itself. `SoftwareApplication` with an explicit free-trial offer is
 * what makes the 30-day pilot eligible to surface as a price annotation, and it
 * is the node an LLM reads to answer "what does it cost".
 */
export const softwareApplicationNode = {
  "@type": "SoftwareApplication",
  "@id": `${siteUrl}/#software`,
  name: "Shadowy",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Client profitability for accounting firms",
  operatingSystem: "Web, iOS, Android",
  url: siteUrl,
  inLanguage: "lv",
  description:
    "Rīks grāmatvedības birojiem: darbinieki 30 sekundēs ieraksta darbu ar balsi vai tekstu, AI to sakārto, un vadītājs redz stundas, pašizmaksu un papildu darba iemeslus pa klientiem.",
  featureList: [
    "Darba ieraksti 30 sekundēs ar balsi vai tekstu (AI melnraksts)",
    "Stundas un pašizmaksa pa klientiem",
    "Klienti, kas pārsniedz iekļauto laiku",
    "Papildu darba iemesli pa kategorijām",
    "Vadītāja izskatīšana un apstiprināšana",
    "Datu eksports",
  ],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
    description: "30 dienu bezmaksas pilotprojekts bez kredītkartes",
    availability: "https://schema.org/InStock",
    url: `${siteUrl}/pilotprojekts`,
  },
  publisher: { "@id": ORGANIZATION_ID },
} as const;

export const faqPageNode = {
  "@type": "FAQPage",
  "@id": `${siteUrl}/#faq`,
  inLanguage: "lv",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question.lv,
    acceptedAnswer: { "@type": "Answer", text: item.answer.lv },
  })),
} as const;

/** A breadcrumb trail for a subpage, so the SERP shows the path, not a bare URL. */
export function breadcrumbNode(
  trail: ReadonlyArray<{ name: string; path: string }>,
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: "Sākums", path: "/" },
      ...trail,
    ].map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.path === "/" ? "" : crumb.path}`,
    })),
  };
}

/**
 * Renders a `@graph` of the given nodes.
 *
 * Server-rendered on purpose: JSON-LD injected after mount is invisible to
 * plain HTML fetches, which is how most AI crawlers read a page.
 */
export function JsonLd({ nodes }: { nodes: ReadonlyArray<object> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": nodes,
        }),
      }}
    />
  );
}
