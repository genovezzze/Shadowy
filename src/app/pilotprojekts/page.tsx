import type { Metadata } from "next";
import { JsonLd, breadcrumbNode, organizationNode, softwareApplicationNode } from "@/lib/structured-data";
import { PilotContent } from "./pilot-content";

const pilotTitle = "30 dienu bezmaksas pilotprojekts";
const pilotDescription =
  "Kādiem uzņēmumiem paredzēts Shadowy pilotprojekts, ko saņemsiet 30 dienu laikā un ko sagaidām no dalībniekiem. Bez maksas un bez kredītkartes";

export const metadata: Metadata = {
  title: pilotTitle,
  description: pilotDescription,
  alternates: { canonical: "/pilotprojekts" },
  openGraph: {
    type: "website",
    locale: "lv_LV",
    url: "/pilotprojekts",
    siteName: "Shadowy",
    title: `${pilotTitle} | Shadowy`,
    description: pilotDescription,
    images: [{ url: "/images/shadowy-dashboard-wide.png", width: 1916, height: 821, alt: "Shadowy darba slodzes pārskats" }],
  },
};

export default function PilotProjectPage() {
  return (
    <>
      <JsonLd nodes={[organizationNode, softwareApplicationNode, breadcrumbNode([{ name: "Pilotprojekts", path: "/pilotprojekts" }])]} />
      <PilotContent />
    </>
  );
}
