"use client";

import { LandingHeroLockup } from "@/components/landing/atoms/landing-hero-lockup";

/**
 * The hero. The lockup (mark + wordmark with the travelling shine, the sentence,
 * the trust row and the pill) is now used at every width - the same screen on
 * phones as on desktop, scaled down through `--lockup-cap` rather than swapped
 * for a different phone-only hero.
 */
export function LandingHero() {
  return <LandingHeroLockup />;
}
