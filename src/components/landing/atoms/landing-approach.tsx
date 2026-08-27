"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  BrainCircuit,
  Check,
  ClipboardList,
  Coins,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { Reveal, SectionBadge } from "@/components/landing/atoms/landing-primitives";
import { cn } from "@/lib/utils";
import { WaveHeading } from "@/components/landing/atoms/wave-heading";

const STAGE_DURATION_MS = 6000;

type Stage = {
  id: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  /** Backdrop behind the floating panel - a different shot per stage. */
  bg: string;
  panel: React.ReactNode;
};

/**
 * Shared shell for the five preview cards. Fixed at 256px wide, matching the
 * reference's own w-64, and now fixed in height too - the five variants carry
 * different content (a chart, a quote, a stat row) and letting each size to
 * its own content is what made them drift apart earlier. A shared height
 * guarantees they read as one consistent card shape as the stage changes,
 * not five differently-sized ones.
 */
function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[210px] w-64 max-w-full flex-col rounded-[4px] border border-black/5 bg-white/95 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.06)] backdrop-blur-sm">
      <p className="mb-2.5 text-base font-bold tracking-tight text-black">
        {title}
      </p>
      {children}
    </div>
  );
}

// Every panel below stops at its data - no trailing "here's what this means"
// line. The reference card is two stat rows and nothing else; a footnote
// under each of ours was what made them read as tall explainer panels rather
// than the compact glance-and-move-on cards this section is built around.

function EntryPanel() {
  return (
    <Panel title="Jauns ieraksts">
      <div className="space-y-2">
        <div className="rounded-[4px] bg-black/[0.04] px-3.5 py-2.5">
          <p className="text-[11px] font-medium text-black/40">Kategorija</p>
          <p className="mt-0.5 text-[15px] font-bold tracking-tight text-black">
            Palīdzēju kolēģim
          </p>
        </div>
        <div className="rounded-[4px] bg-black/[0.04] px-3.5 py-2.5">
          <p className="text-[11px] font-medium text-black/40">Patērētais laiks</p>
          <p className="mt-0.5 text-[15px] font-bold tracking-tight text-black">
            45 minūtes
          </p>
        </div>
      </div>
    </Panel>
  );
}

function DraftPanel() {
  return (
    <Panel title="AI melnraksts">
      <div className="rounded-[4px] border border-black/10 bg-black/[0.02] p-3.5">
        <p className="text-sm font-medium leading-relaxed text-black/70">
          &bdquo;Skaidroju kolēģim VID atskaites sagatavošanu.&ldquo;
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {["Saziņa ar VID", "Palīdzība kolēģim"].map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-black/[0.05] px-3 py-1 text-xs font-medium text-black/60"
          >
            {tag}
          </span>
        ))}
      </div>
    </Panel>
  );
}

function ReviewPanel() {
  const rows = [
    { name: "Anna", detail: "Palīdzība kolēģim · 45 min", approved: true },
    { name: "Jānis", detail: "Informācijas gaidīšana · 1 h 20 min", approved: true },
  ];

  return (
    <Panel title="Vadītāja skats">
      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={row.name}
            className="flex items-center justify-between gap-4 rounded-[4px] bg-black/[0.04] px-3.5 py-2.5"
          >
            <span className="min-w-0">
              <span className="block text-[15px] font-bold tracking-tight text-black">
                {row.name}
              </span>
              <span className="block truncate text-[11px] font-medium text-black/40">
                {row.detail}
              </span>
            </span>
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full",
                row.approved
                  ? "bg-[#2563eb] text-white"
                  : "border border-black/15 text-black/30",
              )}
            >
              <Check className="size-3.5" strokeWidth={3} aria-hidden />
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function CategoriesPanel() {
  const bars = [
    { label: "Palīdzība kolēģiem", value: 34 },
    { label: "Informācijas gaidīšana", value: 26 },
    { label: "Atkārtoti jautājumi", value: 19 },
  ];

  return (
    <Panel title="Kategoriju sadalījums">
      <ul className="space-y-3">
        {bars.map((bar) => (
          <li key={bar.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-4">
              <span className="text-[13px] font-medium text-black/70">
                {bar.label}
              </span>
              <span className="text-[13px] font-bold tabular-nums text-black">
                {bar.value}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.07]">
              <motion.div
                className="h-full rounded-full bg-black"
                initial={{ width: 0 }}
                animate={{ width: `${bar.value}%` }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function CostPanel() {
  return (
    <Panel title="Organizācijas pārskats">
      <div className="flex items-baseline gap-2">
        <span className="text-[32px] font-bold leading-none tracking-tight text-black">
          186
        </span>
        <span className="text-sm font-medium text-black/45">h / mēnesī</span>
      </div>

      {/* One tile rather than two - the number row already fills the slot the
          other cards give their second data block, so a second tile here
          would push this card past the shared height instead of matching it. */}
      <div className="mt-3 rounded-[4px] bg-black/[0.04] px-3.5 py-2.5">
        <p className="text-[11px] font-medium text-black/40">Aptuvenās izmaksas</p>
        <p className="mt-0.5 text-lg font-bold tracking-tight text-black">
          &euro; 4 650
        </p>
      </div>
    </Panel>
  );
}

const STAGES: Stage[] = [
  {
    id: "fiksesana",
    icon: ClipboardList,
    title: "Darbinieks fiksē",
    desc: "30 sekundes dienā. Tikai tas, kas bija ārpus pamatdarba, radīja papildu slodzi vai traucēja paveikt plānoto",
    bg: "/images/pic1.webp",
    panel: <EntryPanel />,
  },
  {
    id: "melnraksts",
    icon: BrainCircuit,
    title: "AI sagatavo melnrakstu",
    desc: "No brīvi uzrakstīta teikuma top strukturēts ieraksts ar kategoriju un laiku. Darbinieks to pārskata un apstiprina",
    bg: "/images/pic2.webp",
    panel: <DraftPanel />,
  },
  {
    id: "izvertesana",
    icon: Check,
    title: "Vadītājs izvērtē",
    desc: "Vadītājs redz savas komandas iesniegtos ierakstus, apstiprina tos vai atgriež precizēšanai",
    bg: "/images/pic3.webp",
    panel: <ReviewPanel />,
  },
  {
    id: "strukturesana",
    icon: Layers,
    title: "Dati sakārtojas",
    desc: "Apstiprinātie ieraksti veido kategorijas, tendences un atkārtojošos šķēršļus - nevis atsevišķus stāstus",
    bg: "/images/pic4.webp",
    panel: <CategoriesPanel />,
  },
  {
    id: "parskats",
    icon: Coins,
    title: "Uzņēmums redz izmaksas",
    desc: "Slodze, aptuvenās izmaksas un dārgākie klienti vienā pārskatā. Ar konkrētiem procesu ieteikumiem",
    bg: "/images/pic5.webp",
    panel: <CostPanel />,
  },
];

/**
 * The stage list drives the panel beside it and advances on its own, so a
 * visitor who never clicks still sees the whole flow. Hovering the list stops
 * the timer - reading a stage should not be interrupted by it moving on.
 */
export function LandingApproach() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (paused) return;

    const timer = window.setInterval(
      () => setActiveIndex((index) => (index + 1) % STAGES.length),
      STAGE_DURATION_MS,
    );

    return () => window.clearInterval(timer);
  }, [paused]);

  const active = STAGES[activeIndex];

  return (
    <section
      id="process"
      className="relative scroll-mt-20 bg-[var(--landing-paper)] py-24 md:py-32"
    >
      <div className="w-full px-4 md:px-8">
        <Reveal className="mb-12 max-w-3xl md:mb-16">
          <div className="mb-3 inline-block">
            <SectionBadge>Process</SectionBadge>
          </div>
          <h2 className="text-landing-h2 text-black">
            <WaveHeading tone="dark">Kā Shadowy strādā</WaveHeading>
          </h2>
        </Reveal>

        <div className="flex flex-col-reverse items-start gap-6 lg:min-h-[560px] lg:flex-row lg:gap-8">
          <div
            className="flex w-full flex-col items-start gap-3 lg:w-[45%]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {STAGES.map((stage, index) => {
              const isActive = index === activeIndex;
              const Icon = stage.icon;

              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-current={isActive}
                  className={cn(
                    "group w-full overflow-hidden rounded-[4px] text-left transition-colors duration-300",
                    isActive
                      ? "bg-white shadow-[0_8px_30px_rgba(0,0,0,0.05)] ring-1 ring-black/5"
                      : "bg-black/[0.04] hover:bg-black/[0.07]",
                  )}
                >
                  <div className="flex items-center gap-4 p-5">
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-[4px] transition-colors",
                        isActive
                          ? "bg-black text-white"
                          : "bg-black/5 text-black group-hover:bg-black/10",
                      )}
                    >
                      <Icon className="size-[18px]" strokeWidth={2} aria-hidden />
                    </span>
                    <h3 className="text-[17px] font-bold tracking-tight text-black">
                      {stage.title}
                    </h3>
                  </div>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm font-semibold leading-relaxed text-black/70 md:text-base">
                          {stage.desc}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>

          {/* The card floats over a full-bleed photo rather than filling the
              column itself - the photo carries the height (aspect-ratio on
              phones, self-stretch to match the stage list on desktop) and the
              card just sits centred on top of it, sized to its own content
              16:10 rather than the taller 4:3 - the fixed 210px card doesn't
              need the extra headroom, and on tablet widths 4:3 was turning the
              whole panel into a slab far taller than the list beside it. */}
          <div className="w-full overflow-hidden rounded-2xl lg:w-[55%] lg:self-stretch">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="relative flex aspect-[16/10] w-full items-center justify-center p-5 sm:p-8 lg:aspect-auto lg:h-full"
              >
                <Image
                  src={active.bg}
                  alt=""
                  fill
                  priority={activeIndex === 0}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover"
                />
                <div className="relative z-10">{active.panel}</div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
