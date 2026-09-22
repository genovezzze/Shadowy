"use client";

"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Reveal, SectionBadge } from "@/components/landing/atoms/landing-primitives";
import { WaveHeading } from "@/components/landing/atoms/wave-heading";
import { useLocale, type Locale } from "@/components/landing/atoms/i18n";

const PILOT_BENEFITS: readonly Record<Locale, string>[] = [
  {
    lv: "2 nedēļas, 5-8 darbinieki, 30 sekundes dienā",
    en: "2 weeks, 5-8 employees, 30 seconds a day",
  },
  { lv: "Bez kredītkartes un bez saistībām", en: "No credit card, no commitment" },
  { lv: "Iestatīšana līdz 10 minūtēm", en: "Setup in under 10 minutes" },
  {
    lv: "Pilns atbalsts latviski visā pilota laikā",
    en: "Full support throughout the pilot",
  },
];

export function LandingPilotBanner() {
  const { locale, t } = useLocale();
  return (
    <section className="relative overflow-hidden bg-[var(--landing-night)] py-16 md:py-32">
      <div className="relative z-10 w-full px-4 md:px-8">
        <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <Reveal className="lg:w-1/2">
            <div className="mb-4 inline-block">
              <SectionBadge tone="dark">{t("pilotBanner.badge")}</SectionBadge>
            </div>
            <h2 className="text-landing-h2 text-white">
              <WaveHeading tone="light">{t("pilotBanner.heading")}</WaveHeading>
            </h2>
            <p className="mt-6 max-w-xl text-sm font-semibold leading-relaxed md:text-base">
              <WaveHeading tone="light" settledColor="rgba(255,255,255,0.6)">
                {t("pilotBanner.subtitle")}
              </WaveHeading>
            </p>
            <Link
              href="#pilots"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-bold text-black transition-all hover:bg-white/90 active:scale-95"
            >
              {t("pilotBanner.cta")}
            </Link>
          </Reveal>

          <Reveal delay={0.1} className="w-full lg:w-[45%]">
            <ul className="space-y-px overflow-hidden rounded-[4px] border border-white/10">
              {PILOT_BENEFITS.map((benefit) => (
                <li
                  key={benefit.lv}
                  className="flex items-start gap-3 bg-white/[0.03] px-5 py-4 text-sm font-medium leading-relaxed text-white/75"
                >
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#2563eb] text-white">
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                  {benefit[locale]}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
