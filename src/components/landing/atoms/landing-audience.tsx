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
import { useLocale, type Locale } from "@/components/landing/atoms/i18n";

type L = Record<Locale, string>;

type Figure = { value: string; label: L };

type HelpEdge = {
  to: L;
  times: number;
  minutes: number;
  topCategory: L;
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
  { to: { lv: "Kolēģis A", en: "Colleague A" }, times: 30, minutes: 1240, topCategory: { lv: "Dokumentu skenēšana", en: "Document scanning" } },
  { to: { lv: "Kolēģis B", en: "Colleague B" }, times: 24, minutes: 1119, topCategory: { lv: "Rēķinu grāmatošana", en: "Invoice posting" } },
  { to: { lv: "Kolēģis C", en: "Colleague C" }, times: 18, minutes: 965, topCategory: { lv: "Avansu grāmatošana", en: "Advance posting" } },
  { to: { lv: "Kolēģis D", en: "Colleague D" }, times: 14, minutes: 650, topCategory: { lv: "Kases grāmatošana", en: "Cash posting" } },
  { to: { lv: "Kolēģis E", en: "Colleague E" }, times: 12, minutes: 590, topCategory: { lv: "Rēķinu grāmatošana", en: "Invoice posting" } },
  { to: { lv: "Kolēģis F", en: "Colleague F" }, times: 3, minutes: 125, topCategory: { lv: "Dokumentu skenēšana", en: "Document scanning" } },
  { to: { lv: "Kolēģis G", en: "Colleague G" }, times: 1, minutes: 45, topCategory: { lv: "Dokumentu arhivēšana", en: "Document archiving" } },
];

type Audience = {
  name: L;
  desc: L;
  /** The case the row has to make once it is opened. */
  why: L;
  examples: readonly L[];
  figures?: readonly Figure[];
  /** Arithmetic on the figures above, so the reader can check it rather than trust it. */
  figuresNote?: L;
  /** Real help relationships, drawn as a distribution rather than listed. */
  helpFlow?: readonly HelpEdge[];
  image?: {
    src: string;
    width: number;
    height: number;
    alt: string;
    caption: L;
  };
  link: { label: L; href: string };
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
    name: { lv: "Darbiniekiem", en: "For employees" },
    desc: {
      lv: "Vienkārša darba fiksēšana bez papildu kontroles - 30 sekundes dienā, un pats darbinieks izlemj, ko iesniegt",
      en: "Simple logging with no extra oversight - 30 seconds a day, and the employee decides what to submit",
    },
    why: {
      lv: "Papildu darbs, ko darbinieks izdara, nekur neparādās. Kad plānotais darbs kavējas, redzams tikai kavējums - nevis tās stundas, kas aizgāja palīdzībai kolēģiem, gaidīšanai un pārtraukumiem. Shadowy dod vietu, kur to pateikt, neizklausoties pēc attaisnošanās",
      en: "The extra work an employee does shows up nowhere. When planned work runs late, only the delay is visible - not the hours that went into helping colleagues, waiting and interruptions. Shadowy gives a place to say it without it sounding like an excuse",
    },
    examples: [
      { lv: "Čeku un rēķinu grāmatošana kolēģa vietā - 135 ieraksti, 113 stundas", en: "Posting receipts and invoices for a colleague - 135 entries, 113 hours" },
      { lv: "Dokumentu skenēšana citas komandas vietā - biežākais palīdzības veids", en: "Scanning documents for another team - the most common kind of help" },
      { lv: "Bankas izraksta manuāla ievade, kad automātiskais imports neaizgāja", en: "Entering a bank statement by hand when the automatic import failed" },
      { lv: "Darba devēja ziņojumi un sarakste ar VID ārpus savas lomas", en: "Employer reports and correspondence with the tax authority outside one's role" },
      { lv: "Jaunā darbinieka ievadīšana - vidēji 54 minūtes par reizi", en: "Onboarding a new hire - 54 minutes on average each time" },
    ],
    figures: [
      { value: "100%", label: { lv: "ierakstu apstiprināti - neviens nav atgriezts", en: "of entries approved - none returned" } },
      { value: "19%", label: { lv: "no visa fiksētā laika bija palīdzība kolēģiem", en: "of all logged time was helping colleagues" } },
      { value: "76%", label: { lv: "tās palīdzības veica viens cilvēks", en: "of that help was done by one person" } },
      { value: "113 h", label: { lv: "palīdzības 2 mēnešos - gandrīz 3 darba nedēļas", en: "of help in 2 months - nearly 3 working weeks" } },
      { value: "26 min", label: { lv: "mediānais ieraksts", en: "median entry" } },
      { value: "25%", label: { lv: "ierakstu īsāki par 10 minūtēm", en: "of entries shorter than 10 minutes" } },
    ],
    figuresNote: {
      lv: "Reāli PB Finanses pilota dati no 2026. gada 6. jūlija līdz 9. septembrim: 830 ieraksti, 10 cilvēku komanda, 599 fiksētas stundas",
      en: "Real PB Finanses pilot data from 6 July to 9 September 2026: 830 entries, a team of 10, 599 logged hours",
    },
    helpFlow: HELP_FLOW,
    image: {
      src: "/images/pic11.png",
      width: 1672,
      height: 941,
      alt: "Darbinieka skats Shadowy: iesniegtie ieraksti, apstiprinātās stundas un sadalījums pa kategorijām",
      caption: { lv: "Darbinieka skats. Ekrānattēlā - demonstrācijas dati", en: "Employee view. The screen shows demo data" },
    },
    link: { label: { lv: "Ko fiksēt un ko nē", en: "What to log and what not to" }, href: "#ko-fikset" },
  },
  {
    name: { lv: "Vadītājiem", en: "For managers" },
    desc: {
      lv: "Skaidrs skats uz savas komandas slodzi: izvērtējiet un apstipriniet ierakstus, redziet, kas atkārtojas",
      en: "A clear view of your team's workload: review and approve entries, see what recurs",
    },
    why: {
      lv: "Slodzi plāno pēc oficiālajiem pienākumiem, bet komanda strādā pēc faktiskajiem. Tāpēc plāns nesanāk, un iemesls nav redzams nevienā atskaitē. Vadītājam tas dod divas lietas, kuras citādi nav no kā paņemt: kurš process atkārtojas tik bieži, ka to ir lētāk salabot nekā izturēt, un kurš cilvēks komandā nes vairāk, nekā izskatās no malas",
      en: "Workload is planned by official duties, but the team works by the real ones. So the plan doesn't hold, and the reason shows up in no report. It gives a manager two things there's otherwise nowhere to get: which process repeats often enough that fixing it is cheaper than enduring it, and which person carries more than it looks from the outside",
    },
    examples: [
      { lv: "82 atkārtojušies procesi: viena un tā pati kategorija pie viena klienta trīs un vairāk reizes", en: "82 recurring processes: the same category with the same client three or more times" },
      { lv: "Trīs cilvēki nes 59% no visa fiksētā laika - pārējie septiņi pārējo", en: "Three people carry 59% of all logged time - the other seven the rest" },
      { lv: "Noslogotākajam 153 stundas, viszemākajam 8 - vienā un tajā pašā komandā", en: "The busiest has 153 hours, the lowest 8 - in the same team" },
      { lv: "42 dažādas kategorijas: darbs ir krietni sadrumstalotāks, nekā izskatās plānā", en: "42 different categories: the work is far more fragmented than the plan suggests" },
      { lv: "Jūlijs 217 h, augusts 240 h - slodze aug, nevis svārstās", en: "July 217 h, August 240 h - the load is growing, not fluctuating" },
    ],
    figures: [
      { value: "48%", label: { lv: "ierakstu ietilpst darbā, kas atkārtojas", en: "of entries fall into work that repeats" } },
      { value: "82", label: { lv: "atkārtoti procesi, ko var labot pa vienam", en: "recurring processes you can fix one by one" } },
      { value: "59%", label: { lv: "visa laika - uz trim cilvēkiem no desmit", en: "of all time - on three people out of ten" } },
      { value: "26%", label: { lv: "visa laika - uz vienu noslogotāko cilvēku", en: "of all time - on the single busiest person" } },
      { value: "42", label: { lv: "dažādas kategorijas vienā komandā", en: "different categories in one team" } },
      { value: "43 min", label: { lv: "vidējais ieraksts", en: "average entry" } },
    ],
    figuresNote: {
      lv: "Reāli PB Finanses pilota dati (06.07.-09.09.2026.), 830 ieraksti no 10 cilvēkiem. \"Atkārtojas\" nozīmē vienu kategoriju pie viena klienta trīs un vairāk reizes - tieši tur meklējams process, nevis atsevišķs gadījums",
      en: "Real PB Finanses pilot data (06.07.-09.09.2026), 830 entries from 10 people. \"Repeats\" means one category with one client three or more times - that's where a process is, not a one-off",
    },
    link: { label: { lv: "Kā notiek izskatīšana", en: "How the review works" }, href: "#process" },
  },
  {
    name: { lv: "Uzņēmumam", en: "For the company" },
    desc: {
      lv: "Organizācijas līmeņa pārskats - stundas, kategorijas, izmaksas un klientu rentabilitāte vienuviet",
      en: "An organisation-level overview - hours, categories, cost and client profitability in one place",
    },
    why: {
      lv: "Ar fiksētu pakalpojumu maksu klients var būt nerentabls mēnešiem, un tas atklājas gada beigās - ja vispār. Kad komandas laiks ir piesaistīts klientam un reizināts ar stundas likmi, pārsniegums kļūst redzams tajā pašā mēnesī, kad tas notiek - un kļūst redzams arī tas, cik nevienmērīgi portfelis patiesībā ir sadalīts",
      en: "On a fixed service fee a client can be unprofitable for months, and it only surfaces at year end - if at all. When the team's time is tied to a client and multiplied by an hourly rate, the overrun becomes visible in the same month it happens - and so does how unevenly the portfolio is really split",
    },
    examples: [
      { lv: "Pieci lielākie klienti aizņem 30% no visa komandas laika", en: "The five largest clients take up 30% of all team time" },
      { lv: "Lielākais klients - 58 stundas divos mēnešos, nākamais 37", en: "The largest client - 58 hours in two months, the next 37" },
      { lv: "Mediānais klients - 2,4 stundas: lielākā daļa portfeļa ir maza", en: "The median client - 2.4 hours: most of the portfolio is small" },
      { lv: "17 klienti zem vienas stundas, 15 klienti virs desmit", en: "17 clients under one hour, 15 clients over ten" },
      { lv: "Rēķinu grāmatošana un izrakstīšana - 140 ieraksti, 139 stundas kopā", en: "Invoice posting and issuing - 140 entries, 139 hours in total" },
      { lv: "Trešdaļa ierakstu ir īsāki par 15 minūtēm - tie, ko neviens neuzskaita", en: "A third of entries are under 15 minutes - the ones nobody counts" },
    ],
    figures: [
      { value: "94", label: { lv: "klienti ar ierakstiem divos mēnešos", en: "clients with entries in two months" } },
      { value: "30%", label: { lv: "laika - uz pieciem lielākajiem klientiem", en: "of time - on the five largest clients" } },
      { value: "58 h", label: { lv: "lielākais klients; mediānais - 2,4 h", en: "largest client; median - 2.4 h" } },
      { value: "15", label: { lv: "klienti virs 10 stundām", en: "clients over 10 hours" } },
      { value: "17", label: { lv: "klienti zem vienas stundas", en: "clients under one hour" } },
      { value: "599 h", label: { lv: "kopā, sadalītas pa klientiem", en: "in total, split across clients" } },
    ],
    figuresNote: {
      lv: "Reāli PB Finanses pilota dati (06.07.-09.09.2026.). Kad šīs stundas ir piesaistītas klientam un reizinātas ar komandas stundas likmi, kļūst redzams, kurš klients ar fiksētu maksu nesedz savu darbu",
      en: "Real PB Finanses pilot data (06.07.-09.09.2026). When these hours are tied to a client and multiplied by the team's hourly rate, it becomes clear which fixed-fee client doesn't cover its own work",
    },
    image: {
      src: "/images/shadowy-dashboard-wide.png",
      width: 1916,
      height: 821,
      alt: "Shadowy organizācijas pārskats: klientiem veltītās stundas, darba pašizmaksa un limita pārsniegums",
      caption: {
        lv: "Organizācijas pārskats. Klientu nosaukumi un summas - izdomāts piemērs",
        en: "Organisation overview. Client names and amounts - an illustrative example",
      },
    },
    link: { label: { lv: "Skatīt reālu projektu", en: "See a real project" }, href: "/projekti/pb-finanses" },
  },
  {
    name: { lv: "Datu drošībai", en: "For data safety" },
    desc: {
      lv: "Vadītājiem pieejami tikai savas komandas ieraksti, administratoriem - savas organizācijas dati. Nekas vairāk",
      en: "Managers can only access their own team's entries, administrators only their organisation's data. Nothing more",
    },
    why: {
      lv: "Ja komanda uztver rīku kā novērošanu, tā to neizmanto, un dati ir bezvērtīgi. Tāpēc redzamība ir ierobežota pēc lomas, un darbinieks pats izlemj, kas nonāk sistēmā",
      en: "If a team sees the tool as surveillance, they won't use it, and the data is worthless. So visibility is limited by role, and the employee decides what goes into the system",
    },
    examples: [
      { lv: "Vadītājs redz savas komandas apstiprinātos ierakstus - ne citu komandu", en: "A manager sees their own team's approved entries - not other teams'" },
      { lv: "Ekrāna aktivitāte, taustiņi un privātas sarunas netiek fiksētas vispār", en: "Screen activity, keystrokes and private conversations are not logged at all" },
      { lv: "AI veido tikai melnrakstu - nekas netiek saglabāts bez darbinieka apstiprinājuma", en: "The AI only makes a draft - nothing is saved without the employee's approval" },
      { lv: "Pēc pilota datus var eksportēt, un pēc glabāšanas perioda tie tiek dzēsti", en: "After the pilot the data can be exported, and after the retention period it is deleted" },
    ],
    link: { label: { lv: "Privātuma politika", en: "Privacy policy" }, href: "/privacy" },
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
  const { locale } = useLocale();
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
            <SectionBadge>{locale === "lv" ? "Kas kuram palīdzēja" : "Who helped whom"}</SectionBadge>
          </div>
          <p className="max-w-xl text-base font-semibold leading-relaxed text-black/70 md:text-lg">
            {locale === "lv" ? (
              <>
                Viens cilvēks komandā fiksēja {totalTimes} no {135} palīdzības
                ierakstiem - {hours(totalMinutes)} stundas septiņiem kolēģiem divos
                mēnešos. Neviena iepriekšējā atskaite to nerādīja.
              </>
            ) : (
              <>
                One person on the team logged {totalTimes} of {135} help
                entries - {hours(totalMinutes)} hours for seven colleagues over
                two months. No previous report showed it.
              </>
            )}
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
            <li key={edge.to.lv} className="flex items-center gap-4">
              <span className="w-24 shrink-0 text-sm font-bold tracking-tight text-black md:w-28">
                {edge.to[locale]}
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
                      {edge.topCategory[locale]}
                    </span>
                  )}
                </motion.span>

                {!labelInside && (
                  <span
                    style={{ left: `calc(${share * 100}% + 0.75rem)` }}
                    className="absolute inset-y-0 hidden items-center whitespace-nowrap text-xs font-semibold text-black/45 sm:flex"
                  >
                    {edge.topCategory[locale]}
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
        {locale === "lv"
          ? "Reāli PB Finanses pilota dati (06.07.-09.09.2026.). Kolēģi apzīmēti ar burtiem - nozīme ir slodzes sadalījumam, nevis konkrētiem cilvēkiem."
          : "Real PB Finanses pilot data (06.07.-09.09.2026). Colleagues are lettered - what matters is how the load is distributed, not the individuals."}
      </p>
    </div>
  );
}

export function LandingAudience() {
  const { locale, t } = useLocale();
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
  // Opens like the FAQ: a plain toggle, with the panel height handled purely in
  // CSS (grid-template-rows 0fr → 1fr below). No scroll correction — that hack
  // is what made the page lurch on open/close.
  const openRow = React.useCallback((name: string, isOpen: boolean) => {
    setOpenName(isOpen ? null : name);
  }, []);

  return (
    <section
      id="kam-noder"
      // No top padding: "Ko fiksē Shadowy" above is the same paper colour and
      // already ends on its own py-24/py-32, so a second one stacked a band of
      // empty white with no colour change to justify it.
      className="relative scroll-mt-20 overflow-hidden bg-[var(--landing-paper)] pb-16 pt-0 md:pb-32"
    >
      <div className="relative z-10 w-full px-4 md:px-8">
        <Reveal className="mb-8 max-w-3xl md:mb-16">
          <div className="mb-3 inline-block">
            <SectionBadge>{t("audience.badge")}</SectionBadge>
          </div>
          <h2 className="text-landing-h2 text-black">
            <WaveHeading tone="dark">{t("audience.heading")}</WaveHeading>
          </h2>
        </Reveal>

        <Reveal className="border-t border-black/10">
          {AUDIENCES.map((audience) => {
            const key = audience.name.lv;
            const isOpen = openName === key;
            const panelId = `audience-${key}`;

            return (
              <div
                key={key}
                ref={(node) => {
                  rowRefs.current[key] = node;
                }}
                className="scroll-mt-28 border-b border-black/10"
              >
                {/* A button rather than the link this row used to be: it now
                    answers "why does this matter to me" in place, instead of
                    throwing the reader at an anchor further down the page. The
                    link it carried lives on at the foot of the panel. */}
                <button
                  type="button"
                  onClick={() => openRow(key, isOpen)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="group relative flex w-full flex-row items-center justify-between py-6 text-left md:py-8"
                >
                  <div className="flex flex-col gap-0.5 pr-8">
                    <span className="text-2xl font-bold leading-tight tracking-tight text-black md:text-3xl">
                      <HoverWaveText text={audience.name[locale]} />
                    </span>
                    <p
                      className={cn(
                        "max-w-xl text-sm font-normal transition-colors md:text-base",
                        isOpen
                          ? "text-black/60"
                          : "text-black/40 group-hover:text-black/60",
                      )}
                    >
                      {audience.desc[locale]}
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

                <div
                  id={panelId}
                  aria-hidden={!isOpen}
                  className="grid transition-[grid-template-rows] duration-500 ease-out motion-reduce:transition-none"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
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
                        {audience.why[locale]}
                      </motion.p>

                      <motion.div variants={PANEL_ITEM} className="mt-7 inline-block">
                        <SectionBadge>{t("audience.examples")}</SectionBadge>
                      </motion.div>
                      <ul className="mt-4 flex flex-col gap-2">
                        {audience.examples.map((example) => (
                          <motion.li
                            key={example.lv}
                            variants={PANEL_ITEM}
                            className="flex gap-2.5 text-sm font-semibold leading-relaxed text-black/60 md:text-base"
                          >
                            <span
                              aria-hidden
                              className="mt-[0.55em] h-px w-3 shrink-0 bg-black/25"
                            />
                            {example[locale]}
                          </motion.li>
                        ))}
                      </ul>

                      <motion.div variants={PANEL_ITEM} className="inline-block">
                      <Link
                        href={audience.link.href}
                        className="mt-7 inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-black/85 active:scale-[0.98]"
                      >
                        {audience.link.label[locale]}
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
                                key={figure.label.lv}
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
                                  {figure.label[locale]}
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
                            {audience.figuresNote[locale]}
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
                            {audience.image.caption[locale]}
                          </figcaption>
                        </figure>
                      )}
                    </div>
                  </motion.div>

                  {audience.helpFlow && <HelpFlow flow={audience.helpFlow} />}
                  </div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
