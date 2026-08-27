"use client";

import * as React from "react";
import { getCalApi } from "@calcom/embed-react";

/**
 * Which cal.com event the button opens, as `username/event-slug`.
 *
 * Set NEXT_PUBLIC_CAL_LINK to point it at the real account - it has to be a
 * NEXT_PUBLIC_ var because the embed runs in the browser. The fallback below is
 * a placeholder so the button is visible while developing; it will 404 until
 * the variable is set.
 */
const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK ?? "shadowy/20min";

/**
 * The namespace keeps this embed's config separate from any other cal.com
 * embed added later on the same page.
 */
const CAL_NAMESPACE = "pilot-call";

/**
 * Opens the cal.com booking calendar over the page instead of navigating away.
 *
 * The embed script is loaded by getCalApi on mount and the button is wired to
 * it through the data-cal-* attributes, which is how the official embed finds
 * its trigger - there is no onClick of our own to keep in sync.
 */
export function CalBookButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      const cal = await getCalApi({ namespace: CAL_NAMESPACE });
      if (cancelled) return;
      cal("ui", {
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <button
      type="button"
      data-cal-namespace={CAL_NAMESPACE}
      data-cal-link={CAL_LINK}
      data-cal-config={`{"layout":"month_view"}`}
      className={className}
    >
      {children}
    </button>
  );
}
