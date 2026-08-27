"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/landing/atoms/landing-primitives";
import { WaveHeading } from "@/components/landing/atoms/wave-heading";

type Outcome = {
  tag: string;
  title: string;
  text: string;
};

const OUTCOMES: Outcome[] = [
  {
    tag: "Stundas",
    title: "Slēptās darba stundas",
    text: "Cik daudz laika aizgāja papildu darbā, gaidīšanā un pārtraukumos",
  },
  {
    tag: "Izmaksas",
    title: "Aptuvenās izmaksas",
    text: "Cik šis darbs varētu izmaksāt komandai mēnesī vai gadā",
  },
  {
    tag: "Tendences",
    title: "Atkārtotās problēmas",
    text: "Kas visbiežāk traucē pamatdarbam un atkārtojas komandā",
  },
  {
    tag: "Klienti",
    title: "Klientu patiesā cena",
    text: "Kuri klienti prasa visvairāk neplānota un neapmaksāta laika",
  },
  {
    tag: "Slodze",
    title: "Nevienmērīga slodze",
    text: "Kur darbs sadalās nevienlīdzīgi starp cilvēkiem un lomām",
  },
  {
    tag: "Rīcība",
    title: "Procesu ieteikumi",
    text: "2-3 konkrēti uzlabojumi, ko var ieviest komandā uzreiz pēc pilota",
  },
];

export function LandingOutcomes() {
  return (
    <section
      id="ieguvumi"
      // Less top padding than the reference's 128px so the badge and heading
      // sit higher in the band rather than floating in empty sky.
      className="relative scroll-mt-20 overflow-hidden pb-[360px] pt-16 sm:pb-32 sm:pt-20"
      style={{
        // The reference's own stops, except the last: it ends on #E8F0F7, a
        // blue-white that would leave a visible seam against the neutral
        // #FAFAFA of the section below, so the fade lands on that instead.
        background:
          "linear-gradient(180deg, #5B82AB 0%, #B6CCDF 45%, #FAFAFA 100%)",
      }}
    >
      {/* Sized as a share of the section itself, not a fixed box - explicit
          width/height rather than `fill` so the className below controls the
          rendered size directly instead of fighting next/image's own inset-0
          sizing. Bleeds off both the left and bottom edges of the section
          (negative left and bottom) rather than sitting flush in the corner,
          which is what makes it read as scenery continuing past the frame
          instead of a sticker pinned inside it. The white cards sit above it
          (z-10 on the content wrapper below), so any overlap under their
          edges is simply hidden, not clipped. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/images/back3.webp"
          alt=""
          width={1832}
          height={910}
          // The illustration carries its own sky, which never matches the
          // section gradient exactly at whatever height its top edge lands -
          // so that edge read as a hard horizontal line across the band.
          // Fading the top third of the image into transparency dissolves the
          // seam and lets the painted sky hand over to the gradient.
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0%, #000 32%, #000 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, #000 32%, #000 100%)",
          }}
          className="absolute bottom-0 left-1/2 h-auto w-[220%] max-w-none -translate-x-1/2 object-contain object-left-bottom sm:bottom-auto sm:top-[10%] sm:w-[120%] lg:left-[-5%] lg:top-auto lg:bottom-0 lg:w-[120%] lg:translate-x-0"
        />
      </div>

      <div className="relative z-10 w-full px-4 md:px-8">
        <div className="flex flex-col items-start gap-12 lg:flex-row lg:gap-24">
          <Reveal className="lg:w-1/3">
            <div className="mb-4 inline-block">
              <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-1 text-sm font-medium text-white">
                Ieguvumi
              </span>
            </div>
            <h2 className="text-landing-h2 text-white">
              <WaveHeading tone="light">Ko jūs redzēsiet pēc pilota</WaveHeading>
            </h2>
            <Link
              href="#pilots"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black transition-all hover:bg-white/90 active:scale-[0.98]"
            >
              Sākt pilotu
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </Reveal>

          <div className="grid w-full gap-6 sm:grid-cols-2 lg:w-2/3">
            {OUTCOMES.map((outcome, index) => (
              <Reveal key={outcome.title} delay={0.05 * index}>
                {/* Title leads, tag sits at the foot behind a hairline rule -
                    the icon that used to head the card is gone, so nothing
                    competes with the heading for the top of the card
                    justify-between pins the tag to the bottom edge, keeping
                    tags aligned across a row whose descriptions differ in
                    length. Sizes are the reference's own: 32px padding, 16px
                    radius, 24px title, 16px body, and a 290px floor so the
                    cards carry the same presence as there despite having no
                    button to fill the last row. */}
                <article className="flex h-full min-h-[290px] flex-col justify-between rounded-2xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)]">
                  <div>
                    <h3 className="text-xl font-bold leading-tight tracking-tight text-black md:text-2xl">
                      {outcome.title}
                    </h3>
                    <p className="mt-3 text-sm font-semibold leading-relaxed text-black/60 md:text-base">
                      {outcome.text}
                    </p>
                  </div>

                  <div className="mt-8">
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-px shrink-0 bg-black/15" aria-hidden />
                      <span className="rounded-[4px] bg-black/5 px-3 py-1 text-[13px] font-bold leading-tight tracking-tight text-black/70 md:text-sm">
                        {outcome.tag}
                      </span>
                    </div>

                    <Link
                      href="#pilots"
                      className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black/85"
                    >
                      Uzzināt vairāk
                      <ArrowUpRight className="size-4" aria-hidden />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
