import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/atoms/landing-page";

export const metadata: Metadata = {
  title: {
    absolute: "Shadowy",
  },
  description:
    "Shadowy palīdz uzņēmumiem pamanīt slēpto darba slodzi, papildu pienākumus un darbu ārpus oficiālās lomas - bez darbinieku novērošanas.",
  openGraph: {
    title: "Shadowy",
    description:
      "Ieraugiet komandas neredzamo darbu un pieņemiet labākus lēmumus pēc datiem.",
    type: "website",
    locale: "lv_LV",
  },
};

export default function HomePage() {
  return (
    <LandingPage />
  );
}
