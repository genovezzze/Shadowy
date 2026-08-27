import { LandingNav } from "@/components/landing/atoms/landing-nav";
import { LandingHero } from "@/components/landing/atoms/landing-hero";
import { LandingCases } from "@/components/landing/atoms/landing-cases";
import { LandingApproach } from "@/components/landing/atoms/landing-approach";
import { LandingOutcomes } from "@/components/landing/atoms/landing-outcomes";
import { LandingWhatToLog } from "@/components/landing/atoms/landing-what-to-log";
import { LandingAudience } from "@/components/landing/atoms/landing-audience";
import { LandingPilotBanner } from "@/components/landing/atoms/landing-pilot-banner";
import { LandingFaq } from "@/components/landing/atoms/landing-faq";
import { LandingContact } from "@/components/landing/atoms/landing-contact";
import { LandingFooter } from "@/components/landing/atoms/landing-footer";
import { LandingIntro } from "@/components/landing/atoms/landing-intro";
import { LandingInterestModal } from "@/components/landing/atoms/landing-interest-modal";

/**
 * The page runs dark → light → dark: the hero lockup over its video, the
 * substance of the product on white, then the pilot ask back on near-black.
 * The two switches are what give the page its shape, so sections should not be
 * reordered across a boundary without moving the boundary with them.
 *
 * The nav reads the first of those switches to decide whether to paint itself
 * light or dark, so the hero has to stay one viewport tall and stay first.
 */
export function LandingPage() {
  return (
    <div className="atoms-landing bg-[#070809] font-sans antialiased">
      <LandingIntro />
      <LandingInterestModal />
      <LandingNav />
      <main>
        <LandingHero />
        <LandingCases />
        <LandingApproach />
        <LandingOutcomes />
        <LandingWhatToLog />
        <LandingAudience />
        <LandingPilotBanner />
        <LandingFaq />
        <LandingContact />
      </main>
      <LandingFooter />
    </div>
  );
}
