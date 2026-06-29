import type { Metadata } from "next";
import { HeroSection } from "@/components/ui/hero-section-1";

export const metadata: Metadata = {
  title: "Shadowy — Padariet neredzamo darbu redzamu",
  description:
    "Shadowy palīdz uzņēmumiem pamanīt slēpto darba slodzi, papildu pienākumus un darbu ārpus oficiālās lomas — bez darbinieku novērošanas.",
  openGraph: {
    title: "Shadowy — Padariet neredzamo darbu redzamu",
    description:
      "Ieraugiet komandas neredzamo darbu un pieņemiet labākus lēmumus pēc datiem.",
    type: "website",
    locale: "lv_LV",
  },
};

export default function HomePage() {
  return (
    <div className="dark">
      <HeroSection />
    </div>
  );
}
