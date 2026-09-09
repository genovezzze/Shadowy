"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Reveal, SectionBadge } from "@/components/landing/atoms/landing-primitives";
import { WaveHeading } from "@/components/landing/atoms/wave-heading";
import { HoverWaveText } from "@/components/landing/atoms/hover-wave-text";
import { cn } from "@/lib/utils";

type Figure = { value: string; label: string };

type HelpEdge = {
  to: string;
  times: number;
  minutes: number;
  topCategory: string;
};

/**
 * Who carried the helping, read from the pilot's own `helpedColleague` entries.
 *
 * Colleagues are lettered rather than named: this is one real ten-person firm,
 * and the finding is about the shape of the load, not about individuals. The
 * shape is the whole point - 103 of the 135 help entries came from a single
 * person, spread across seven colleagues, and nothing the firm had before this
 * showed that.
 */
const HELP_FLOW: readonly HelpEdge[] = [
  { to: "Kolēģis A", times: 30, minutes: 1240, topCategory: "Dokumentu skenēšana" },
  { to: "Kolēģis B", times: 24, minutes: 1119, topCategory: "Rēķinu grāmatošana" },
  { to: "Kolēģis C", times: 18, minutes: 965, topCategory: "Avansu grāmatošana" },
  { to: "Kolēģis D", times: 14, minutes: 650, topCategory: "Kases grāmatošana" },
  { to: "Kolēģis E", times: 12, minutes: 590, topCategory: "Rēķinu grāmatošana" },
  { to: "Kolēģis F", times: 3, minutes: 125, topCategory: "Dokumentu skenēšana" },
  { to: "Kolēģis G", times: 1, minutes: 45, topCategory: "Dokumentu arhivēšana" },
];

type Audience = {
  name: string;
  desc: string;
  /** The case the row has to make once it is opened. */
  why: string;
  examples: readonly string[];
  figures?: readonly Figure[];
  /** Arithmetic on the figures above, so the reader can check it rather than trust it. */
  figuresNote?: string;
  /** Real help relationships, drawn as a distribution rather than listed. */
  helpFlow?: readonly HelpEdge[];
  image?: {
    src: string;
    width: number;
    height: number;
    alt: string;
    caption: string;
  };
  link: { label: string; href: string };
};

/**
 * These are measured figures from the PB Finanses pilot, not scenarios.
 *
 * Read from the pilot database on 2026-09-09: 830 approved entries by 10 people
 * across 94 clients, 6 July to 9 September 2026, 35 947 logged minutes. Only
 * aggregates are used - no entry text, no client names, no employee names, since
 * the underlying records are a real firm's working notes.
 *
 * Two things to keep straight when editing. The 599 h is *logged* work, not all
 * of it invisible - the same store holds ordinary bookkeeping - so the copy says
 * "fiksēts", never "neredzams", about that total. And the figures carry a date,
 * because they grow: re-read the database before changing them rather than
 * nudging a number to look better.
 *
 * The approval figure is the load-bearing one for employees: all 830 entries
 * were approved, none rejected, none returned, and not one carries a manager
 * comment. That is the answer to "will this be used against me", and it is worth
 * checking it still holds before it is restated.
 */
const AUDIENCES: readonly Audience[] = [
  {
    name: "Darbiniekiem",
    desc: "Vienkārša darba fiksēšana bez papildu kontroles - 30 sekundes dienā, un pats darbinieks izlemj, ko iesniegt",
    why: "Papildu darbs, ko darbinieks izdara, nekur neparādās. Kad plānotais darbs kavējas, redzams tikai kavējums - nevis tās stundas, kas aizgāja palīdzībai kolēģiem, gaidīšanai un pārtraukumiem. Shadowy dod vietu, kur to pateikt, neizklausoties pēc attaisnošanās",
    examples: [
      "Čeku un rēķinu grāmatošana kolēģa vietā - 135 ieraksti, 113 stundas",
      "Dokumentu skenēšana citas komandas vietā - biežākais palīdzības veids",
      "Bankas izraksta manuāla ievade, kad automātiskais imports neaizgāja",
      "Darba devēja ziņojumi un sarakste ar VID ārpus savas lomas",
      "Jaunā darbinieka ievadīšana - vidēji 54 minūtes par reizi",
    ],
    figures: [
      { value: "100%", label: "ierakstu apstiprināti - neviens nav atgriezts" },
      { value: "19%", label: "no visa fiksētā laika bija palīdzība kolēģiem" },
      { value: "76%", label: "tās palīdzības veica viens cilvēks" },
      { value: "113 h", label: "palīdzības 2 mēnešos - gandrīz 3 darba nedēļas" },
      { value: "26 min", label: "mediānais ieraksts" },
      { value: "25%", label: "ierakstu īsāki par 10 minūtēm" },
    ],
    figuresNote:
      "Reāli PB Finanses pilota dati no 2026. gada 6. jūlija līdz 9. septembrim: 830 ieraksti, 10 cilvēku komanda, 599 fiksētas stundas",
    helpFlow: HELP_FLOW,
    image: {
      src: "/images/pic11.png",
      width: 1672,
      height: 941,
      alt: "Darbinieka skats Shadowy: iesniegtie ieraksti, apstiprinātās stundas un sadalījums pa kategorijām",
      caption: "Darbinieka skats. Ekrānattēlā - demonstrācijas dati",
    },
    link: { label: "Ko fiksēt un ko nē", href: "#ko-fikset" },
  },
  {
    name: "Vadītājiem",
    desc: "Skaidrs skats uz savas komandas slodzi: izvērtējiet un apstipriniet ierakstus, redziet, kas atkārtojas",
    why: "Slodzi plāno pēc oficiālajiem pienākumiem, bet komanda strādā pēc faktiskajiem. Tāpēc plāns nesanāk, un iemesls nav redzams nevienā atskaitē. Vadītājam tas dod divas lietas, kuras citādi nav no kā paņemt: kurš process atkārtojas tik bieži, ka to ir lētāk salabot nekā izturēt, un kurš cilvēks komandā nes vairāk, nekā izskatās no malas",
    examples: [
      "82 atkārtojušies procesi: viena un tā pati kategorija pie viena klienta trīs un vairāk reizes",
      "Trīs cilvēki nes 59% no visa fiksētā laika - pārējie septiņi pārējo",
      "Noslogotākajam 153 stundas, viszemākajam 8 - vienā un tajā pašā komandā",
      "42 dažādas kategorijas: darbs ir krietni sadrumstalotāks, nekā izskatās plānā",
      "Jūlijs 217 h, augusts 240 h - slodze aug, nevis svārstās",
    ],
    figures: [
      { value: "48%", label: "ierakstu ietilpst darbā, kas atkārtojas" },
      { value: "82", label: "atkārtoti procesi, ko var labot pa vienam" },
      { value: "59%", label: "visa laika - uz trim cilvēkiem no desmit" },
      { value: "26%", label: "visa laika - uz vienu noslogotāko cilvēku" },
      { value: "42", label: "dažādas kategorijas vienā komandā" },
      { value: "43 min", label: "vidējais ieraksts" },
    ],
    figuresNote:
      "Reāli PB Finanses pilota dati (06.07.-09.09.2026.), 830 ieraksti no 10 cilvēkiem. \"Atkārtojas\" nozīmē vienu kategoriju pie viena klienta trīs un vairāk reizes - tieši tur meklējams process, nevis atsevišķs gadījums",
    link: { label: "Kā notiek izskatīšana", href: "#process" },
  },
  {
    name: "Uzņēmumam",
    desc: "Organizācijas līmeņa pārskats - stundas, kategorijas, izmaksas un klientu rentabilitāte vienuviet",
    why: "Ar fiksētu pakalpojumu maksu klients var būt nerentabls mēnešiem, un tas atklājas gada beigās - ja vispār. Kad komandas laiks ir piesaistīts klientam un reizināts ar stundas likmi, pārsniegums kļūst redzams tajā pašā mēnesī, kad tas notiek - un kļūst redzams arī tas, cik nevienmērīgi portfelis patiesībā ir sadalīts",
    examples: [
      "Pieci lielākie klienti aizņem 30% no visa komandas laika",
      "Lielākais klients - 58 stundas divos mēnešos, nākamais 37",
      "Mediānais klients - 2,4 stundas: lielākā daļa portfeļa ir maza",
      "17 klienti zem vienas stundas, 15 klienti virs desmit",
      "Rēķinu grāmatošana un izrakstīšana - 140 ieraksti, 139 stundas kopā",
      "Trešdaļa ierakstu ir īsāki par 15 minūtēm - tie, ko neviens neuzskaita",
    ],
    figures: [
      { value: "94", label: "klienti ar ierakstiem divos mēnešos" },
      { value: "30%", label: "laika - uz pieciem lielākajiem klientiem" },
      { value: "58 h", label: "lielākais klients; mediānais - 2,4 h" },
      { value: "15", label: "klienti virs 10 stundām" },
      { value: "17", label: "klienti zem vienas stundas" },
      { value: "599 h", label: "kopā, sadalītas pa klientiem" },
    ],
    figuresNote:
      "Reāli PB Finanses pilota dati (06.07.-09.09.2026.). Kad šīs stundas ir piesaistītas klientam un reizinātas ar komandas stundas likmi, kļūst redzams, kurš klients ar fiksētu maksu nesedz savu darbu",
    image: {
      src: "/images/shadowy-dashboard-wide.png",
      width: 1916,
      height: 821,
      alt: "Shadowy organizācijas pārskats: klientiem veltītās stundas, darba pašizmaksa un limita pārsniegums",
      caption:
        "Organizācijas pārskats. Klientu nosaukumi un summas - izdomāts piemērs",
    },
    link: { label: "Skatīt reālu projektu", href: "/projekti/pb-finanses" },
  },
  {
    name: "Datu drošībai",
    desc: "Vadītājiem pieejami tikai savas komandas ieraksti, administratoriem - savas organizācijas dati. Nekas vairāk",
    why: "Ja komanda uztver rīku kā novērošanu, tā to neizmanto, un dati ir bezvērtīgi. Tāpēc redzamība ir ierobežota pēc lomas, un darbinieks pats izlemj, kas nonāk sistēmā",
    examples: [
      "Vadītājs redz savas komandas apstiprinātos ierakstus - ne citu komandu",
      "Ekrāna aktivitāte, taustiņi un privātas sarunas netiek fiksētas vispār",
      "AI veido tikai melnrakstu - nekas netiek saglabāts bez darbinieka apstiprinājuma",
      "Pēc pilota datus var eksportēt, un pēc glabāšanas perioda tie tiek dzēsti",
    ],
    link: { label: "Privātuma politika", href: "/privacy" },
  },
];

/**
 * The help distribution, drawn rather than listed.
 *
 * A list of "30 times, 24 times, 18 times" reads as trivia; the same numbers as
 * bars read as one person carrying most of it, which is the actual finding. The
 * bars are scaled to hours, not to the number of entries, because an hour of
 * scanning someone else's documents is the thing that cost the helper their day.
 */
/**
 * One colour per recipient, so the seven rows read as seven different people
 * rather than one quantity measured seven times. Ordered to descend with the
 * bars, and all at the 600 step, which keeps white label text legible on every
 * one of them.
 */
const BAR_COLOURS = [
  "#4f46e5",
  "#7c3aed",
  "#2563eb",
  "#0d9488",
  "#16a34a",
  "#d97706",
  "#e11d48",
] as const;

/**
 * The total, counted up rather than simply printed.
 *
 * It is the one number in the block that carries the finding, so it gets the
 * emphasis and the bars underneath stay plain. Follows the same rhythm as the
 * report metrics on the case study - a quartic ease-out, so it sprints and then
 * settles on the figure instead of crawling the last stretch.
 */
function CountUpHours({ minutes }: { minutes: number }) {
  const ref = React.useRef<HTMLParagraphElement>(null);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const target = minutes / 60;
  const [current, setCurrent] = React.useState(reduceMotion ? target : 0);

  React.useEffect(() => {
    if (reduceMotion) {
      setCurrent(target);
      return;
    }
    if (!isInView) return;

    const duration = 2600;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // Quintic: it sprints through the first two thirds and spends the rest
      // easing onto the figure, which is what makes the count read as an
      // arrival rather than a slider being dragged.
      setCurrent(target * (1 - Math.pow(1 - progress, 5)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, reduceMotion, target]);

  return (
    <motion.p
      ref={ref}
      // The number lands before it starts counting: it swings up from slightly
      // under size, so the count begins on a figure that is already the loudest
      // thing in the block.
      initial={reduceMotion ? false : { opacity: 0, scale: 0.72, y: 16 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      // `tabular-nums` so the digits do not jostle the line width while they run.
      className="shrink-0 origin-right text-right text-5xl font-bold tabular-nums leading-none tracking-tight text-black md:text-7xl"
    >
      {current.toFixed(1).replace(".", ",")} h
    </motion.p>
  );
}

/**
 * One colour per tile - carried by the card, not by the type.
 *
 * These are the tint end of the same hues the help chart uses at full strength,
 * chosen so black text sits on them at full contrast. Colouring the numerals
 * instead made each tile read as a different kind of thing; colouring the card
 * keeps the figures uniform and lets the block read as one set.
 */
const FIGURE_TINTS = [
  "#e0e7ff",
  "#ccfbf1",
  "#ffe4e6",
  "#fef3c7",
  "#dbeafe",
  "#ede9fe",
] as const;

/**
 * A figure that counts up to itself.
 *
 * The values are written as display strings - "100%", "599 h", "3 mēneši" - so
 * the first number in the string is what runs and everything around it is kept
 * verbatim. That way the data stays readable where it is declared instead of
 * being split into value-and-unit pairs for the sake of the animation.
 */
function CountUpFigure({ value }: { value: string }) {
  const ref = React.useRef<HTMLParagraphElement>(null);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const match = value.match(/-?\d+(?:[.,]\d+)?/);
  const target = match ? Number(match[0].replace(",", ".")) : null;
  const decimals = match?.[0].includes(",") || match?.[0].includes(".") ? 1 : 0;

  const [current, setCurrent] = React.useState(
    target === null || reduceMotion ? target ?? 0 : 0,
  );

  React.useEffect(() => {
    if (target === null) return;
    if (reduceMotion) {
      setCurrent(target);
      return;
    }
    if (!isInView) return;

    // Long enough that the digits are visibly counted rather than glimpsed.
    const duration = 2400;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // Cubic rather than quartic: a gentler tail keeps the last numbers
      // turning instead of snapping to the total half way through.
      setCurrent(target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, reduceMotion, target]);

  // Measured on the final string, so the class does not change while counting.
  const size =
    value.length <= 4
      ? "text-4xl md:text-5xl"
      : value.length <= 6
        ? "text-3xl md:text-4xl"
        : "text-2xl md:text-3xl";

  const shown =
    target === null || !match
      ? value
      : value.replace(
          match[0],
          current.toFixed(decimals).replace(".", ","),
        );

  return (
    <motion.p
      ref={ref}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.86 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "whitespace-nowrap font-bold leading-none tracking-tight text-black tabular-nums",
        // Stepped off the finished string's length rather than left to wrap:
        // "26 min" broke onto a second line at the largest size and the tile
        // lost its shape. Never wraps now - it shrinks instead.
        size,
      )}
    >
      {shown}
    </motion.p>
  );
}

/** One beat of the panel's opening sequence, shared by every element in it. */
const PANEL_ITEM = {
  shut: { opacity: 0, y: 14 },
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function HelpFlow({ flow }: { flow: readonly HelpEdge[] }) {
  const maxMinutes = Math.max(...flow.map((edge) => edge.minutes));
  const totalMinutes = flow.reduce((sum, edge) => sum + edge.minutes, 0);
  const totalTimes = flow.reduce((sum, edge) => sum + edge.times, 0);
  const hours = (minutes: number) =>
    (minutes / 60).toFixed(1).replace(".", ",");

  return (
    <div className="mb-10 overflow-hidden rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-block">
            <SectionBadge>Kas kuram palīdzēja</SectionBadge>
          </div>
          <p className="max-w-xl text-base font-semibold leading-relaxed text-black/70 md:text-lg">
            Viens cilvēks komandā fiksēja {totalTimes} no {135} palīdzības
            ierakstiem - {hours(totalMinutes)} stundas septiņiem kolēģiem divos
            mēnešos. Neviena iepriekšējā atskaite to nerādīja.
          </p>
        </div>
        <CountUpHours minutes={totalMinutes} />
      </div>

      <ul className="mt-8 flex flex-col gap-3">
        {flow.map((edge, index) => {
          const share = edge.minutes / maxMinutes;
          // Wide bars carry their label inside; the two short ones have no room,
          // so theirs sits after the fill. Placing every label at the fill's
          // right edge is what ran the long ones off the end of the track and
          // clipped them.
          const labelInside = share >= 0.35;

          return (
            <li key={edge.to} className="flex items-center gap-4">
              <span className="w-24 shrink-0 text-sm font-bold tracking-tight text-black md:w-28">
                {edge.to}
              </span>

              <span className="relative h-9 flex-1 overflow-hidden rounded-lg bg-black/[0.04]">
                {/* Width rather than scaleX, so the label inside is not
                    stretched while the bar grows. One duration for every row,
                    with a small stagger: the emphasis belongs to the total
                    above, and seven bars each running at their own speed pulled
                    against it. */}
                <motion.span
                  initial={{ width: 0 }}
                  whileInView={{ width: `${share * 100}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.55,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                  style={{ backgroundColor: BAR_COLOURS[index % BAR_COLOURS.length] }}
                  className="absolute inset-y-0 left-0 flex items-center justify-end overflow-hidden rounded-lg"
                >
                  {labelInside && (
                    <span className="hidden whitespace-nowrap pr-3 text-xs font-semibold text-white/85 sm:block">
                      {edge.topCategory}
                    </span>
                  )}
                </motion.span>

                {!labelInside && (
                  <span
                    style={{ left: `calc(${share * 100}% + 0.75rem)` }}
                    className="absolute inset-y-0 hidden items-center whitespace-nowrap text-xs font-semibold text-black/45 sm:flex"
                  >
                    {edge.topCategory}
                  </span>
                )}
              </span>

              <span className="w-24 shrink-0 text-right text-sm font-bold tabular-nums tracking-tight text-black md:w-28">
                {edge.times}× · {hours(edge.minutes)} h
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-xs font-medium leading-relaxed text-black/45">
        Reāli PB Finanses pilota dati (06.07.-09.09.2026.). Kolēģi apzīmēti ar
        burtiem - nozīme ir slodzes sadalījumam, nevis konkrētiem cilvēkiem.
      </p>
    </div>
  );
}

export function LandingAudience() {
  const [openName, setOpenName] = React.useState<string | null>(null);
  const rowRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  /**
   * Opening a row also closes the one before it, and those panels are not the
   * same height - the employee panel carries six figures, a chart and a
   * screenshot. Collapsing it pulled well over a thousand pixels out from above
   * the reader, so the click appeared to fling the page down to a later section.
   *
   * Bringing the row that was just opened back to the top of the viewport keeps
   * the click and its result in the same place. Only on open: closing a row
   * should leave the reader where they are.
   */
  const openRow = React.useCallback((name: string, isOpen: boolean) => {
    const node = rowRefs.current[name];
    // Where the row sits in the viewport at the moment of the click. That is the
    // position it has to keep.
    const anchor = node?.getBoundingClientRect().top ?? null;

    setOpenName(isOpen ? null : name);

    if (node === null || anchor === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Correcting once is not enough: the panels do not snap, they animate their
    // height over half a second, so the content above keeps moving for frames
    // after the click. Scrolling once - which is what the earlier attempt did -
    // measured a layout that was still in motion and landed somewhere else
    // again. This holds the row against its anchor for the whole transition.
    //
    // Runs for a fixed stretch rather than stopping when the row looks settled.
    // The panels animate over 0.5s and do not begin moving on the very first
    // frame, so a "has it stopped drifting" test saw those still frames as the
    // end and let go before the collapse above had even started - which is how
    // the click still threw the page down.
    const HOLD_MS = 800;
    const started = performance.now();

    const hold = (now: number) => {
      const drift = node.getBoundingClientRect().top - anchor;
      if (Math.abs(drift) > 0.5) window.scrollBy(0, drift);
      if (now - started < HOLD_MS) requestAnimationFrame(hold);
    };

    requestAnimationFrame(hold);
  }, []);

  return (
    <section
      id="kam-noder"
      // No top padding: "Ko fiksē Shadowy" above is the same paper colour and
      // already ends on its own py-24/py-32, so a second one stacked a band of
      // empty white with no colour change to justify it.
      className="relative scroll-mt-20 overflow-hidden bg-[var(--landing-paper)] pb-24 pt-0 md:pb-32"
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
          {AUDIENCES.map((audience) => {
            const isOpen = openName === audience.name;
            const panelId = `audience-${audience.name}`;

            return (
              <div
                key={audience.name}
                ref={(node) => {
                  rowRefs.current[audience.name] = node;
                }}
                className="scroll-mt-28 border-b border-black/10"
              >
                {/* A button rather than the link this row used to be: it now
                    answers "why does this matter to me" in place, instead of
                    throwing the reader at an anchor further down the page. The
                    link it carried lives on at the foot of the panel. */}
                <button
                  type="button"
                  onClick={() => openRow(audience.name, isOpen)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="group relative flex w-full flex-row items-center justify-between py-6 text-left md:py-8"
                >
                  <div className="flex flex-col gap-0.5 pr-8">
                    <span className="text-2xl font-bold leading-tight tracking-tight text-black md:text-3xl">
                      <HoverWaveText text={audience.name} />
                    </span>
                    <p
                      className={cn(
                        "max-w-xl text-sm font-normal transition-colors md:text-base",
                        isOpen
                          ? "text-black/60"
                          : "text-black/40 group-hover:text-black/60",
                      )}
                    >
                      {audience.desc}
                    </p>
                  </div>
                  {/* A chevron, not the arrow: this row expands in place, and
                      on this page the diagonal arrow means the link leaves for
                      another page. Same control the FAQ and the accounting
                      example use, so the three read as one behaviour. */}
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-full border transition-all duration-300 md:size-12",
                      isOpen
                        ? "rotate-180 border-black bg-black text-white"
                        : "border-black/10 text-black/40 group-hover:border-black group-hover:bg-black group-hover:text-white",
                    )}
                  >
                    <ChevronDown className="size-4 md:size-5" aria-hidden />
                  </span>
                </button>

                <motion.div
                  id={panelId}
                  initial={false}
                  animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                  className="overflow-hidden"
                  aria-hidden={!isOpen}
                >
                  {/* The panel's text arrives in sequence once the row opens.
                      Driven by `animate` off `isOpen` rather than `whileInView`:
                      the panel is collapsed to zero height, so a viewport-based
                      trigger would either fire while it is still shut or not at
                      all. */}
                  <motion.div
                    initial={false}
                    animate={isOpen ? "open" : "shut"}
                    variants={{
                      open: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
                      shut: {},
                    }}
                    className="grid gap-8 pb-10 lg:grid-cols-2 lg:gap-12"
                  >
                    <div>
                      <motion.p
                        variants={PANEL_ITEM}
                        className="max-w-xl text-base font-semibold leading-relaxed text-black/70 md:text-lg"
                      >
                        {audience.why}
                      </motion.p>

                      <motion.div variants={PANEL_ITEM} className="mt-7 inline-block">
                        <SectionBadge>Piemēri</SectionBadge>
                      </motion.div>
                      <ul className="mt-4 flex flex-col gap-2">
                        {audience.examples.map((example) => (
                          <motion.li
                            key={example}
                            variants={PANEL_ITEM}
                            className="flex gap-2.5 text-sm font-semibold leading-relaxed text-black/60 md:text-base"
                          >
                            <span
                              aria-hidden
                              className="mt-[0.55em] h-px w-3 shrink-0 bg-black/25"
                            />
                            {example}
                          </motion.li>
                        ))}
                      </ul>

                      <motion.div variants={PANEL_ITEM} className="inline-block">
                      <Link
                        href={audience.link.href}
                        className="mt-7 inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-black/85 active:scale-[0.98]"
                      >
                        {audience.link.label}
                        {/* Only routes get the arrow. Two of these links are
                            in-page anchors that merely scroll, and an arrow
                            there promises a departure that never happens. */}
                        {!audience.link.href.startsWith("#") && (
                          <ArrowUpRight className="size-4" aria-hidden />
                        )}
                      </Link>
                      </motion.div>
                    </div>

                    <div className="flex flex-col gap-6">
                      {audience.figures && audience.figuresNote && (
                        <div>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {/* Each tile rises in on its own beat, the way the
                                section headings do - the panel opens into a
                                grid of numbers, and having them all appear at
                                once wasted the one moment the reader is looking
                                straight at them. */}
                            {audience.figures.map((figure, figureIndex) => (
                              <motion.div
                                key={figure.label}
                                variants={PANEL_ITEM}
                                style={{
                                  backgroundColor:
                                    FIGURE_TINTS[
                                      figureIndex % FIGURE_TINTS.length
                                    ],
                                }}
                                className="rounded-2xl p-5 md:p-6"
                              >
                                <CountUpFigure value={figure.value} />
                                <p className="mt-2.5 text-xs font-semibold leading-snug text-black/70 md:text-sm">
                                  {figure.label}
                                </p>
                              </motion.div>
                            ))}
                          </div>
                          {/* The arithmetic is shown rather than the conclusion
                              asserted - these are scenarios, not pilot data. */}
                          <motion.p
                            variants={PANEL_ITEM}
                            className="mt-3 text-xs font-medium leading-relaxed text-black/45"
                          >
                            {audience.figuresNote}
                          </motion.p>
                        </div>
                      )}

                      {audience.image && (
                        <figure>
                          <div className="overflow-hidden rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                            <Image
                              src={audience.image.src}
                              alt={audience.image.alt}
                              width={audience.image.width}
                              height={audience.image.height}
                              sizes="(min-width: 1024px) 50vw, 100vw"
                              className="h-auto w-full"
                            />
                          </div>
                          <figcaption className="mt-2.5 text-xs font-medium leading-relaxed text-black/45">
                            {audience.image.caption}
                          </figcaption>
                        </figure>
                      )}
                    </div>
                  </motion.div>

                  {audience.helpFlow && <HelpFlow flow={audience.helpFlow} />}
                </motion.div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
