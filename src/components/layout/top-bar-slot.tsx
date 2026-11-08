"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/** id of the element on the right of the desktop top bar that pages can fill. */
export const TOP_BAR_SLOT_ID = "top-bar-slot";

/**
 * Puts page controls (a period switcher, a report link) into the right side of
 * the desktop top bar. On phones the top bar is hidden, so the same controls
 * render in place instead.
 */
export function TopBarSlot({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(document.getElementById(TOP_BAR_SLOT_ID));
  }, []);

  return (
    <>
      <div className="mb-4 flex justify-end md:hidden">{children}</div>
      {target ? createPortal(children, target) : null}
    </>
  );
}
