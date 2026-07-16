"use client";

import { useEffect, useRef, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { SmartWorkLog } from "@/components/entries/smart-work-log";

// Fixed "design" resolution the real app shell is rendered at, then scaled
// down to fit whatever width the landing page gives it - this keeps the
// real components laid out exactly as they are in the actual product,
// regardless of viewport.
const BASE_W = 1280;
const BASE_H = 720;

export function LiveDashboardPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    function update() {
      if (!containerRef.current) return;
      setScale(containerRef.current.offsetWidth / BASE_W);
    }
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="relative aspect-video w-full select-none overflow-hidden rounded-lg border border-border/25 bg-background sm:rounded-2xl"
    >
      <div
        className="pointer-events-none flex origin-top-left bg-background"
        style={{
          width: BASE_W,
          height: BASE_H,
          transform: `scale(${scale})`,
        }}
      >
        <Sidebar
          role="EMPLOYEE"
          userName="Ilze Darbiniece"
          organizationName="Demo Uzņēmums SIA"
          unreadNotificationCount={2}
        />
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="mx-auto max-w-6xl px-8 py-10">
            <SmartWorkLog clients={[]} />
          </div>
        </div>
      </div>
    </div>
  );
}
