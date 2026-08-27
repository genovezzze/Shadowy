"use client";

import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { Reveal, SectionBadge } from "@/components/landing/atoms/landing-primitives";
import { WaveHeading } from "@/components/landing/atoms/wave-heading";

const PILOT_BENEFITS = [
  "2 nedēļas, 5-8 darbinieki, 30 sekundes dienā",
  "Bez kredītkartes un bez saistībām",
  "Iestatīšana līdz 10 minūtēm",
  "Pilns atbalsts latviski visā pilota laikā",
] as const;

export function LandingPilotBanner() {
  return (
    <section className="relative overflow-hidden bg-[var(--landing-night)] py-24 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.08) 0.7px, transparent 0.8px)",
          backgroundSize: "30px 30px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
        }}
      />

      <div className="relative z-10 w-full px-4 md:px-8">
        <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <Reveal className="lg:w-1/2">
            <div className="mb-4 inline-block">
              <SectionBadge tone="dark">Pilots</SectionBadge>
            </div>
            <h2 className="text-landing-h2 text-white">
              <WaveHeading tone="light">Izmēģiniet pilotu bez riska</WaveHeading>
            </h2>
            <p className="mt-6 max-w-xl text-sm font-semibold leading-relaxed text-white/60 md:text-base">
              Aizpildiet formu - sazināsimies 1-2 darba dienu laikā un
              palīdzēsim uzsākt pilotu jūsu komandā
            </p>
            <Link
              href="#pilots"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-bold text-black transition-all hover:bg-white/90 active:scale-95"
            >
              Pieteikties pilotam
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </Reveal>

          <Reveal delay={0.1} className="w-full lg:w-[45%]">
            <ul className="space-y-px overflow-hidden rounded-[4px] border border-white/10">
              {PILOT_BENEFITS.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 bg-white/[0.03] px-5 py-4 text-sm font-medium leading-relaxed text-white/75"
                >
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#2563eb] text-white">
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
