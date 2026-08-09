"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AppLoadingScreen } from "@/components/ui/app-loading-screen";

const REVEAL_DELAY_MS = 180;
const SAFETY_TIMEOUT_MS = 15000;

export function NavigationLoadingOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const routeKey = `${pathname}?${searchParams.toString()}`;

  const clearTimers = useCallback(() => {
    if (revealTimer.current) clearTimeout(revealTimer.current);
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    revealTimer.current = null;
    safetyTimer.current = null;
  }, []);

  const finishLoading = useCallback(() => {
    clearTimers();
    setVisible(false);
  }, [clearTimers]);

  const beginLoading = useCallback(() => {
    clearTimers();
    revealTimer.current = setTimeout(() => {
      setVisible(true);
      revealTimer.current = null;
    }, REVEAL_DELAY_MS);
    safetyTimer.current = setTimeout(finishLoading, SAFETY_TIMEOUT_MS);
  }, [clearTimers, finishLoading]);

  useEffect(() => {
    finishLoading();
  }, [routeKey, finishLoading]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;

      const currentRoute = `${window.location.pathname}${window.location.search}`;
      const nextRoute = `${destination.pathname}${destination.search}`;
      if (currentRoute === nextRoute) return;

      beginLoading();
    };

    const handlePopState = () => beginLoading();
    const handlePageShow = () => finishLoading();
    const handleManualStart = () => beginLoading();

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("shadowy:navigation-start", handleManualStart);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("shadowy:navigation-start", handleManualStart);
      clearTimers();
    };
  }, [beginLoading, clearTimers, finishLoading]);

  return visible ? <AppLoadingScreen /> : null;
}
