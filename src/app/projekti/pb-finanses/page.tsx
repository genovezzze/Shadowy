import type { Metadata } from "next";
import { JsonLd, breadcrumbNode, organizationNode } from "@/lib/structured-data";
import { PbFinansesContent } from "./pb-finanses-content";

const caseTitle = "Grāmatvedības uzņēmuma gadījums: PB Finanses";
const caseDescription =
  "Kā grāmatvedības uzņēmums ar Shadowy ieraudzīja neredzamo darbu, komandas slodzi un klientu patieso pašizmaksu - reāla projekta rezultāti";

export const metadata: Metadata = {
  title: caseTitle,
  description: caseDescription,
  alternates: { canonical: "/projekti/pb-finanses" },
  openGraph: {
    type: "article",
    locale: "lv_LV",
    url: "/projekti/pb-finanses",
    siteName: "Shadowy",
    title: caseTitle,
    description: caseDescription,
    images: [{ url: "/images/shadowyxpb.png", alt: "Shadowy un PB Finanses" }],
  },
};

export default function PbFinansesCasePage() {
  return (
    <>
      <JsonLd nodes={[organizationNode, breadcrumbNode([{ name: "PB Finanses", path: "/projekti/pb-finanses" }])]} />
      <PbFinansesContent />
    </>
  );
}
