"use client";

import * as React from "react";

/**
 * The entry intro overlay was removed: it covered the whole page with a white
 * splash until its pixel fonts loaded, which wrecked LCP (the page sat blank for
 * seconds, longer on a slow network). Other parts of the landing still wait for
 * the intro to "complete" before they start - the hero pixel-logo dissolve and
 * the interest modal - so instead of a visual intro we fire that completion
 * signal immediately on mount, both as the `data-landing-intro-complete` flag
 * and the `shadowy:intro-complete` event, and render nothing.
 */
export function LandingIntro() {
  React.useEffect(() => {
    document.documentElement.dataset.landingIntroComplete = "true";
    window.dispatchEvent(new Event("shadowy:intro-complete"));
  }, []);

  return null;
}
