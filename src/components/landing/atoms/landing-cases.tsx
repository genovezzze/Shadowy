"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { Reveal, SectionBadge } from "@/components/landing/atoms/landing-primitives";
import { WaveHeading } from "@/components/landing/atoms/wave-heading";

const OPEN_SLOTS = [
  {
    eyebrow: "Nākamais stāsts",
    title: "Šeit varētu būt jūsu uzņēmums",
    text: "Pievienojieties pilotam un padariet komandas neredzamo darbu izmērāmu",
  },
  {
    eyebrow: "Atvērta vieta",
    title: "Jūsu pilotprojekts",
    text: "Sākam ar jūsu komandas situāciju un izveidojam praktisku risinājumu",
  },
] as const;

export function LandingCases() {
  return (
    <section
      id="klienti"
      className="relative scroll-mt-20 overflow-hidden bg-[var(--landing-paper)] py-24 md:py-32"
    >

      <div className="relative z-10 w-full px-4 md:px-8">
        <Reveal as="header" className="mb-12 max-w-3xl md:mb-16">
          <div className="mb-3 inline-block">
            <SectionBadge>Projekti</SectionBadge>
          </div>
          <h2 className="text-landing-h2 text-black">
            <WaveHeading tone="dark">Pilotprojekti un klienti</WaveHeading>
          </h2>
        </Reveal>

        {/* Card shell matches the Atoms reference: solid white, generously
            rounded, lifted off the page by a soft shadow instead of a border -
            the 4px radius used elsewhere on the page reads as too tight once a
            card carries this much padding. */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Reveal>
            <Link
              href="/projekti/pb-finanses"
              className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-4"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-black">
                <Image
                  src="/images/shadowyxpb.png"
                  alt="Shadowy un PB Finanses kopprojekts"
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="scale-[1.12] object-cover object-center transition-transform duration-700 group-hover:scale-[1.18]"
                />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[#2563eb] px-3 py-1 text-[11px] font-medium text-white">
                  <Check className="size-3" aria-hidden />
                  Realizēts
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold tracking-tight text-black">
                  PB Finanses
                </h3>
                <p className="mt-1.5 text-sm font-semibold leading-relaxed text-black/70">
                  Vienota platforma neredzamā darba, komandas slodzes un klientu
                  izmaksu pārskatīšanai
                </p>

                {/* Tag and button ride together at the card's bottom edge, so
                    a shorter description on a neighbouring card does not leave
                    its CTA sitting higher than the others in the row. */}
                <div className="mt-auto pt-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3.5 w-px shrink-0 bg-black/15" aria-hidden />
                    <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-bold tracking-tight text-black/70">
                      Grāmatvedības uzņēmums
                    </span>
                  </div>

                  <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-black px-5 py-2 text-[13px] font-bold text-white transition-all group-hover:bg-black/85">
                    Skatīt projektu
                    <ArrowUpRight
                      className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>

          {OPEN_SLOTS.map((slot, index) => (
            <Reveal key={slot.title} delay={0.08 * (index + 1)}>
              <div
                className="group flex h-full flex-col rounded-2xl bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)]"
              >
                <h3 className="text-lg font-bold tracking-tight text-black">
                  {slot.title}
                </h3>
                <p className="mt-1.5 text-sm font-semibold leading-relaxed text-black/70">
                  {slot.text}
                </p>

                <div className="mt-auto pt-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3.5 w-px shrink-0 bg-black/15" aria-hidden />
                    <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-bold tracking-tight text-black/70">
                      {slot.eyebrow}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link
                      href="#pilots"
                      className="inline-flex w-fit items-center gap-1.5 rounded-full bg-black px-5 py-2 text-[13px] font-bold text-white transition-all hover:bg-black/85"
                    >
                      Pieteikties pilotam
                      <ArrowUpRight className="size-3.5" aria-hidden />
                    </Link>
                    <Link
                      href="/pilotprojekts"
                      className="inline-flex w-fit items-center gap-1.5 rounded-full bg-black/5 px-5 py-2 text-[13px] font-bold text-black transition-all hover:bg-black/10"
                    >
                      Uzzināt vairāk
                      <ArrowUpRight className="size-3.5" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
