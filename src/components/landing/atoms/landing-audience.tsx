"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal, SectionBadge } from "@/components/landing/atoms/landing-primitives";
import { WaveHeading } from "@/components/landing/atoms/wave-heading";
import { HoverWaveText } from "@/components/landing/atoms/hover-wave-text";

const AUDIENCES = [
  {
    name: "Darbiniekiem",
    desc: "Vienkārša darba fiksēšana bez papildu kontroles - 30 sekundes dienā, un pats darbinieks izlemj, ko iesniegt",
    href: "#kam-noder",
  },
  {
    name: "Vadītājiem",
    desc: "Skaidrs skats uz savas komandas slodzi: izvērtējiet un apstipriniet ierakstus, redziet, kas atkārtojas",
    href: "#process",
  },
  {
    name: "Uzņēmumam",
    desc: "Organizācijas līmeņa pārskats - stundas, kategorijas, izmaksas un klientu rentabilitāte vienuviet",
    href: "#ieguvumi",
  },
  {
    name: "Datu drošībai",
    desc: "Vadītājiem pieejami tikai savas komandas ieraksti, administratoriem - savas organizācijas dati. Nekas vairāk",
    href: "/privacy",
  },
] as const;

export function LandingAudience() {
  return (
    <section
      id="kam-noder"
      className="relative scroll-mt-20 overflow-hidden bg-[var(--landing-paper)] py-24 md:py-32"
    >

      <div className="relative z-10 w-full px-4 md:px-8">
        <Reveal className="mb-12 max-w-3xl md:mb-16">
          <div className="mb-3 inline-block">
            <SectionBadge>Lomas</SectionBadge>
          </div>
          <h2 className="text-landing-h2 text-black">
            <WaveHeading tone="dark">Kam Shadowy noder</WaveHeading>
          </h2>
        </Reveal>

        <Reveal className="border-t border-black/10">
          {AUDIENCES.map((audience) => (
            <Link
              key={audience.name}
              href={audience.href}
              className="group relative flex flex-row items-center justify-between border-b border-black/10 py-6 md:py-8"
            >
              <div className="flex flex-col gap-0.5 pr-8">
                <span className="text-2xl font-bold leading-tight tracking-tight text-black md:text-3xl">
                  <HoverWaveText text={audience.name} />
                </span>
                <p className="max-w-xl text-sm font-normal text-black/40 transition-colors group-hover:text-black/60 md:text-base">
                  {audience.desc}
                </p>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-black/10 text-black/40 transition-all duration-300 group-hover:-rotate-45 group-hover:border-black group-hover:bg-black group-hover:text-white md:size-12">
                <ArrowUpRight className="size-4 md:size-5" aria-hidden />
              </span>
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
