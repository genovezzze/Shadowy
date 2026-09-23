import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/atoms/landing-page";
import {
  JsonLd,
  faqPageNode,
  organizationNode,
  softwareApplicationNode,
  websiteNode,
} from "@/lib/structured-data";

// The dedicated English entry point. It renders the same landing, but forces
// English on the server so Google indexes an English page under its own URL -
// something the client-side language toggle can never provide, because the
// toggle leaves a single Latvian-HTML URL and only swaps text after hydration.
//
// Brand first so "Shadowy" has a strong English page to attach to, then the
// descriptive keywords an English searcher would actually type.
const title =
  "Shadowy - invisible work & workload transparency platform";
const description =
  "Shadowy is a team workload transparency platform that makes invisible work visible: see lost focus and which clients cost the most - without employee surveillance. Free 30-day pilot.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: "/en",
    languages: { lv: "/", en: "/en", "x-default": "/" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/en",
    siteName: "Shadowy",
    title,
    description,
    images: [
      {
        url: "/images/shadowy-dashboard-wide.png",
        width: 1916,
        height: 821,
        alt: "Shadowy team workload overview",
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

export default function EnglishHomePage() {
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
      <LandingPage forcedLocale="en" />
    </>
  );
}
