"use client";

import { useEffect, useRef, useState } from "react";
import { BatteryFull, SignalHigh, Wifi } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

// Real mobile viewport the /preview/mobile-demo route is rendered at, so
// the actual responsive (sm:/md:) Tailwind breakpoints in the real app
// components resolve exactly as they do on an actual phone.
const PHONE_W = 390;
const PHONE_H = 700;
const STATUS_BAR_H = 44;
const SCREEN_H = STATUS_BAR_H + PHONE_H;

export function MobileDashboardPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const phoneY = useTransform(scrollY, [0, 320], [0, -220]);

  useEffect(() => {
    function update() {
      if (!containerRef.current) return;
      setScale(containerRef.current.offsetWidth / PHONE_W);
    }
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <motion.div
      aria-hidden
      className="relative mx-auto w-full max-w-[320px] select-none"
      style={{
        aspectRatio: `${PHONE_W} / ${SCREEN_H}`,
        marginBottom: reduceMotion ? 0 : -220,
        y: reduceMotion ? 0 : phoneY,
      }}
    >
      {/* Phone bezel - black with a 3D metallic edge */}
      <div
        className="absolute inset-0 rounded-[2.25rem] bg-black p-2"
        style={{
          boxShadow:
            "0 30px 60px -20px rgba(0,0,0,0.85), 0 10px 20px -8px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -1px 2px rgba(255,255,255,0.06), inset 1px 0 1px rgba(255,255,255,0.08), inset -1px 0 1px rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="relative h-full w-full rounded-[1.9rem] bg-black p-[6px]"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
        >
          {/* Notch */}
          <div className="absolute left-1/2 top-[6px] z-20 h-4 w-24 -translate-x-1/2 rounded-b-2xl bg-black" />
          {/* Screen */}
          <div ref={containerRef} className="relative h-full w-full overflow-hidden rounded-[1.5rem] bg-background">
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{ width: PHONE_W, height: SCREEN_H, transform: `scale(${scale})` }}
            >
              {/* iOS-style status bar */}
              <div
                className="flex items-center justify-between bg-background px-6 text-[15px] font-semibold text-foreground"
                style={{ height: STATUS_BAR_H }}
              >
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <SignalHigh className="h-4 w-4" />
                  <Wifi className="h-4 w-4" />
                  <BatteryFull className="h-5 w-5" />
                </div>
              </div>
              <iframe
                src="/preview/mobile-demo"
                title="Shadowy mobilā lietotne"
                tabIndex={-1}
                scrolling="no"
                className="pointer-events-none border-0"
                style={{ width: PHONE_W, height: PHONE_H }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
