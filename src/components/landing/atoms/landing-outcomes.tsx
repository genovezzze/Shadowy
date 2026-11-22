"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/landing/atoms/landing-primitives";
import { useLocale, type Locale } from "@/components/landing/atoms/i18n";
import { cn } from "@/lib/utils";

type L = Record<Locale, string>;
type Outcome = { title: L; text: L; cta?: boolean };

// What the firm has in hand after the pilot, as the atoms.technology grey
// panel: a light title and line drawing on the left, white cards with a corner
// marker on the right. The last card is the answer (blue marker, button).
const OUTCOMES: Outcome[] = [
  {
    title: { lv: "Katra klienta pašizmaksa", en: "The cost of each client" },
    text: {
      lv: "Cik stundu un naudas katrs klients prasa mēnesī un vai tas iekļaujas līgumā paredzētajā laikā",
      en: "How many hours and how much money each client takes per month, and whether it fits the time the contract covers",
    },
  },
  {
    title: { lv: "Kam pārskatīt cenu", en: "Who to reprice" },
    text: {
      lv: "Kuri klienti prasa vairāk, nekā maksā, ar stundām un iemesliem, ko var parādīt sarunā ar klientu",
      en: "Which clients take more than they pay for, with hours and reasons you can show the client",
    },
  },
  {
    title: { lv: "Papildu darba stundas", en: "Extra work hours" },
    text: {
      lv: "Cik laika aizgāja klienta dokumentu labošanā, gaidīšanā un atkārtotos jautājumos",
      en: "How much time went into fixing client documents, waiting and repeated questions",
    },
  },
  {
    title: { lv: "Atkārtotās problēmas", en: "Recurring problems" },
    text: {
      lv: "Kas visbiežāk traucē pamatdarbam un atkārtojas komandā",
      en: "What most often gets in the way of core work and repeats across the team",
    },
  },
  {
    title: { lv: "Nevienmērīga slodze", en: "Uneven workload" },
    text: {
      lv: "Kur darbs sadalās nevienlīdzīgi starp cilvēkiem un lomām",
      en: "Where work is distributed unevenly across people and roles",
    },
  },
  {
    title: { lv: "Procesu ieteikumi", en: "Process suggestions" },
    text: {
      lv: "2-3 konkrēti uzlabojumi, ko var ieviest komandā uzreiz pēc pilota",
      en: "2-3 concrete improvements you can roll out in the team right after the pilot",
    },
    cta: true,
  },
];

// An isometric slab whose top ripples: the flat fixed fee with the real
// workload moving under it. Drawn from a height function, so it is our own
// line art and stays crisp at any size.
const ART_W = 420;
const COS = Math.cos(Math.PI / 6);
function iso(u: number, v: number, h: number) {
  const S = 300;
  return [ART_W / 2 + (u - v) * COS * S * 0.5, 70 + (u + v) * 0.5 * S * 0.5 - h] as const;
}
function pathOf(points: (readonly [number, number])[]) {
  return points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
}
// The surface keeps rolling slowly: `phase` shifts the wave along the slab.
const height = (u: number, v: number, phase = 0) =>
  34 + 26 * Math.sin(u * Math.PI * 1.6 + v * 1.4 - phase) * Math.sin(v * Math.PI * 0.9 + 0.4 + phase * 0.35);
const ROWS = 34;
const STEPS = 48;

function slabPaths(phase: number) {
  const surface = Array.from({ length: ROWS }, (_, r) => {
    const v = r / (ROWS - 1);
    return pathOf(Array.from({ length: STEPS + 1 }, (_, i) => iso(i / STEPS, v, height(i / STEPS, v, phase))));
  });
  const front = Array.from({ length: STEPS + 1 }, (_, i) => iso(i / STEPS, 1, height(i / STEPS, 1, phase)));
  const right = Array.from({ length: STEPS + 1 }, (_, i) => iso(1, i / STEPS, height(1, i / STEPS, phase)));
  return {
    surface,
    front: pathOf(front) + `L${iso(1, 1, 0).join(" ")}L${iso(0, 1, 0).join(" ")}Z`,
    right: pathOf(right) + `L${iso(1, 1, 0).join(" ")}L${iso(1, 0, 0).join(" ")}Z`,
  };
}
const STILL = slabPaths(0);

export function SlabArt({ className, fill = "#f1f1f1" }: { className?: string; fill?: string } = {}) {
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  // Paths are rewritten straight on the DOM each frame (no React re-render),
  // only while the drawing is on screen, and never for reduced motion.
  React.useEffect(() => {
    const svg = svgRef.current;
    // Phones keep the drawing still: the per-frame path rewrite costs too much
    // main-thread time there.
    if (
      !svg ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(min-width: 768px)").matches
    )
      return;
    const lines = Array.from(svg.querySelectorAll<SVGPathElement>("[data-line]"));
    const front = svg.querySelector<SVGPathElement>("[data-front]");
    const right = svg.querySelector<SVGPathElement>("[data-right]");
    let frame = 0;
    let visible = false;
    const start = performance.now();
    const tick = (now: number) => {
      const p = slabPaths(((now - start) / 1000) * 0.6);
      p.surface.forEach((d, i) => lines[i]?.setAttribute("d", d));
      front?.setAttribute("d", p.front);
      right?.setAttribute("d", p.right);
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !visible) {
        visible = true;
        frame = requestAnimationFrame(tick);
      } else if (!entry.isIntersecting && visible) {
        visible = false;
        cancelAnimationFrame(frame);
      }
    });
    observer.observe(svg);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${ART_W} 330`}
      className={className ?? "h-auto w-full max-w-[460px] text-black lg:max-w-[520px] 2xl:max-w-[640px]"}
      aria-hidden
    >
      <g fill="none" stroke="currentColor" strokeWidth={0.8} strokeOpacity={0.55}>
        {STILL.surface.map((d, i) => (
          <path key={i} data-line d={d} />
        ))}
      </g>
      <g fill={fill} stroke="currentColor" strokeWidth={0.9} strokeOpacity={0.7}>
        <path data-right d={STILL.right} />
        <path data-front d={STILL.front} />
      </g>
    </svg>
  );
}

export function LandingOutcomes() {
  const { locale, t } = useLocale();
  return (
    <section id="ieguvumi" className="relative scroll-mt-20 bg-[var(--landing-paper)] px-3 py-8 md:px-6 md:py-12">
      <div className="rounded-[28px] bg-[#f1f1f1] p-6 md:p-10 xl:p-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <Reveal className="flex flex-col">
            <h2 className="text-[clamp(2.2rem,4.4vw,3.6rem)] font-light leading-[1.05] tracking-tight text-black">
              {locale === "lv" ? (
                <>
                  Ko jūs redzēsiet
                  <br />
                  pēc pilota
                </>
              ) : (
                <>
                  What you&apos;ll see
                  <br />
                  after the pilot
                </>
              )}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-black/55">
              {locale === "lv"
                ? "Pēc 30 dienām birojs redz skaitļos to, ko līdz šim zināja tikai pēc sajūtas"
                : "After 30 days the firm sees in numbers what it used to know only by feel"}
            </p>
            <div className="mt-6 flex flex-1 items-center justify-center lg:mt-6">
              <SlabArt />
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {OUTCOMES.map((item, index) => (
              <Reveal key={item.title.lv} delay={0.04 * index}>
                <article className="relative flex h-full flex-col gap-4 rounded-2xl bg-white p-6 md:p-7">
                  {/* Corner marker: grey on the findings, blue on the answer. */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute right-6 top-6 size-3 [clip-path:polygon(0_0,100%_0,100%_100%)] md:right-7 md:top-7",
                      item.cta ? "bg-[#2563eb]" : "bg-black/40",
                    )}
                  />
                  <h3 className="max-w-[85%] text-[1.6rem] font-light leading-[1.15] tracking-tight text-black">
                    {item.title[locale]}
                  </h3>
                  <div>
                    <p className="text-[15px] leading-relaxed text-black/55">{item.text[locale]}</p>
                    {item.cta ? (
                      <Link
                        href="#pilots"
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black/85"
                      >
                        {t("outcomes.cta")}
                        <ArrowRight className="size-4" aria-hidden />
                      </Link>
                    ) : null}
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
