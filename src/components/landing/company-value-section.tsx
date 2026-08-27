"use client";

import { ValueCardGrid, type ValueCard } from "@/components/landing/value-cards";

const cards: readonly ValueCard[] = [
  {
    icon: "/images/icons-3d/money_bag.png",
    title: "Redzamas slēptās izmaksas",
    text: "Neuzskaitītais darbs pārtop skaitļos, nevis paliek sajūtu līmenī.",
  },
  {
    icon: "/images/icons-3d/balance_scale.png",
    title: "Godīgāka slodzes sadale",
    text: "Redzams, kuras lomas ir pārslogotas un kur komandā ir brīva jauda.",
  },
  {
    icon: "/images/icons-3d/bullseye.png",
    title: "Lēmumi, balstīti datos",
    text: "Skaidrs, kurus procesus sakārtot vispirms, lai ieguvums būtu lielākais",
  },
  {
    icon: "/images/icons-3d/shield.png",
    title: "Mazāk izdegšanas riska",
    text: "Pārslodze pamanāma savlaicīgi, pirms cilvēki sāk meklēt citu darbu.",
  },
] as const;

export function CompanyValueSection() {
  return (
    <section
      id="uznemumam"
      aria-labelledby="company-value-heading"
      className="relative scroll-mt-24 overflow-hidden bg-[#070809] pt-6 pb-12 sm:pt-8 sm:pb-20 md:pb-24"
    >
      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          {/* Mirrored against the employee section: cards left, text right.
              The heading stays first in the DOM so it still leads the section
              on mobile and for screen readers - only the desktop column order
              flips. */}
          <div className="min-w-0 lg:order-2">
            <h2
              id="company-value-heading"
              className="text-balance font-accent text-[clamp(1.35rem,4vw,2.5rem)] font-bold uppercase leading-none tracking-[0.015em] text-[#75babc] [font-synthesis:weight] lg:whitespace-nowrap"
            >
              Ko iegūst uzņēmums?
            </h2>
            <p className="mt-4 max-w-md font-accent text-base font-light leading-relaxed tracking-[0.01em] text-white/55 sm:mt-5 sm:text-xl">
              Shadowy nerāda, kurš strādā vairāk, bet{" "}
              <strong className="font-semibold text-white/75 [font-synthesis:weight]">
                parāda, kur uzņēmums zaudē laiku un naudu
              </strong>
            </p>
          </div>

          <div className="min-w-0 lg:order-1">
            <ValueCardGrid cards={cards} />
          </div>
        </div>
      </div>
    </section>
  );
}
