"use client";

import { ValueCardGrid, type ValueCard } from "@/components/landing/value-cards";

const cards: readonly ValueCard[] = [
  {
    icon: "/images/icons-3d/bell_with_slash.png",
    title: "Mazāk lieku pārtraukumu",
    text: "Shadowy palīdz parādīt, kas traucē paveikt pamatdarbu ātrāk.",
  },
  {
    icon: "/images/icons-3d/eye.png",
    title: "Redzams papildu ieguldījums",
    text: "Palīdzība kolēģiem, onboarding un koordinācija vairs nepaliek neredzama.",
  },
  {
    icon: "/images/icons-3d/card_index_dividers.png",
    title: "Skaidrākas atbildības",
    text: "Dati palīdz saprast, kur darbinieks regulāri dara darbu ārpus savas lomas.",
  },
  {
    icon: "/images/icons-3d/high_voltage.png",
    title: "Mazāk haosa komandā",
    text: "Atkārtoti jautājumi un gaidīšana kļūst redzami, lai tos varētu samazināt.",
  },
] as const;

export function EmployeeValueSection() {
  return (
    <section
      id="darbiniekiem"
      aria-labelledby="employee-value-heading"
      className="relative scroll-mt-24 overflow-hidden bg-[#070809] pt-12 pb-6 sm:pt-20 sm:pb-8 md:pt-24"
    >
      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* Left: text */}
          <div className="min-w-0">
            <h2
              id="employee-value-heading"
              className="text-balance font-accent text-[clamp(1.35rem,4vw,2.5rem)] font-bold uppercase leading-none tracking-[0.015em] text-[#75babc] [font-synthesis:weight] lg:whitespace-nowrap"
            >
              Ko iegūst darbinieks?
            </h2>
            <p className="mt-4 max-w-md font-accent text-base font-light leading-relaxed tracking-[0.01em] text-white/55 sm:mt-5 sm:text-xl">
              Shadowy palīdz nevis pierādīt, ka cilvēks strādā, bet{" "}
              <strong className="font-semibold text-white/75 [font-synthesis:weight]">
                parādīt, kas viņam traucē strādāt efektīvāk.
              </strong>
            </p>
          </div>

          {/* Right: 2×2 grid with hover effects */}
          <ValueCardGrid cards={cards} />
        </div>
      </div>
    </section>
  );
}
