import type { Metadata } from "next";
import { HeroSection } from "@/components/ui/hero-section-1";

export const metadata: Metadata = {
  title: "Hero component demo",
  robots: { index: false, follow: false },
};

export default function HeroDemoPage() {
  return (
    <div className="dark">
      <HeroSection />
    </div>
  );
}
