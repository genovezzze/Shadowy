import { LandingNav } from "@/components/landing/atoms/landing-nav";
import { LandingHero } from "@/components/landing/atoms/landing-hero";
import { LandingCases } from "@/components/landing/atoms/landing-cases";
import { LandingApproach } from "@/components/landing/atoms/landing-approach";
import { LandingOutcomes } from "@/components/landing/atoms/landing-outcomes";
import { LandingProduct } from "@/components/landing/atoms/landing-product";
import { LandingWhatToLog } from "@/components/landing/atoms/landing-what-to-log";
import { LandingAudience } from "@/components/landing/atoms/landing-audience";
import { LandingPilotBanner } from "@/components/landing/atoms/landing-pilot-banner";
import { LandingFaq } from "@/components/landing/atoms/landing-faq";
import { LandingContact } from "@/components/landing/atoms/landing-contact";
import { LandingClosing } from "@/components/landing/atoms/landing-closing";
import { LocaleProvider, type Locale } from "@/components/landing/atoms/i18n";
import { LandingFooter } from "@/components/landing/atoms/landing-footer";
import { LandingIntro } from "@/components/landing/atoms/landing-intro";

/**
 * The page runs dark → light → dark: the hero lockup over its video, the
 * substance of the product on white, then the pilot ask back on near-black.
 * The two switches are what give the page its shape, so sections should not be
 * reordered across a boundary without moving the boundary with them.
 *
 * The nav reads the first of those switches to decide whether to paint itself
 * light or dark, so the hero has to stay one viewport tall and stay first.
 */
export function LandingPage({ forcedLocale }: { forcedLocale?: Locale } = {}) {
  return (
    <LocaleProvider forcedLocale={forcedLocale}>
    <div className="atoms-landing bg-[#070809] font-sans antialiased">
      <LandingIntro />
      <LandingNav />
      <main>
        <LandingHero />
        <LandingProduct />
        <LandingApproach />
        <LandingCases />
        <LandingOutcomes />
        <LandingWhatToLog />
        <LandingAudience />
        <LandingPilotBanner />
        <LandingFaq />
        <LandingContact />
      </main>
      <LandingFooter />
      <LandingClosing />
    </div>
    </LocaleProvider>
  );
}
