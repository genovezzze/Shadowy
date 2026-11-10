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
import type { PilotStats } from "@/lib/pilot-stats";

type L = Record<Locale, string>;

type Figure = { value: string; label: L };

type HelpEdge = {
  to: L;
  times: number;
  minutes: number;
  /** Category labels are Latvian domain terms; the English page shows them as is. */
  topCategory: string | null;
};

type Audience = {
  name: L;
  desc: L;
  /** The case the row has to make once it is opened. */
  why: L;
  examples: readonly L[];
  figures?: readonly Figure[];
  /** Where the figures come from and as of when, so the reader can check them. */
  figuresNote?: L;
  /** Real help relationships, drawn as a distribution rather than listed. */
  helpFlow?: {
    edges: readonly HelpEdge[];
    /** Help entries the one busiest helper logged, out of all help entries. */
    helperEntries: number;
    allEntries: number;
    note: L;
  };
  image?: {
    src: string;
    width: number;
    height: number;
    alt: string;
    caption: L;
  };
  link: { label: L; href: string };
};

const LV_MONTHS = ["Janvāris", "Februāris", "Marts", "Aprīlis", "Maijs", "Jūnijs", "Jūlijs", "Augusts", "Septembris", "Oktobris", "Novembris", "Decembris"];
const EN_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Whole hours once there are enough of them; one decimal below ten. */
function hours(minutes: number, locale: Locale) {
  const value = minutes / 60;
  const text = value >= 10 ? String(Math.round(value)) : value.toFixed(1);
  return locale === "lv" ? text.replace(".", ",") : text;
}

function both(make: (locale: Locale) => string): L {
  return { lv: make("lv"), en: make("en") };
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/**
 * Measured figures from the PB Finanses pilot, recomputed daily by
 * `getPilotStats` - PB Finanses agreed to publish their aggregates live.
 *
 * Because the numbers move, every sentence here has to stay true for any value:
 * labels describe the measure rather than draw a conclusion from today's
 * number, and the one trend line ("slodze aug") is only said when the last two
 * complete months actually show it. The hours are *logged* work, not all of it
 * extra - the same store holds ordinary bookkeeping - so totals are "fiksēts",
 * never "neredzams".
 */
function buildAudiences(s: PilotStats): readonly Audience[] {
  const since = formatDate(s.startedOn);
  const asOf = formatDate(s.asOf);
  const source: L = {
    lv: `Reāli PB Finanses pilota dati kopš ${since}., atjaunināti ${asOf}.`,
    en: `Real PB Finanses pilot data since ${since}, updated ${asOf}`,
  };
  const others = s.people - 3;

  const employeeExamples: L[] = [
    both((l) =>
      l === "lv"
        ? `Palīdzība kolēģiem: ${s.helpEntries} ieraksti, ${hours(s.helpMinutes, l)} stundas`
        : `Helping colleagues: ${s.helpEntries} entries, ${hours(s.helpMinutes, l)} hours`,
    ),
    { lv: "Dokumentu skenēšana un grāmatošana kolēģa vietā", en: "Scanning and posting documents for a colleague" },
    { lv: "Bankas izraksta manuāla ievade, kad automātiskais imports neaizgāja", en: "Entering a bank statement by hand when the automatic import failed" },
    { lv: "Darba devēja ziņojumi un sarakste ar VID ārpus savas lomas", en: "Employer reports and correspondence with the tax authority outside one's role" },
    { lv: "Jaunā darbinieka ievadīšana", en: "Onboarding a new hire" },
  ];

  const [prevMonth, lastMonth] = s.months.slice(-2);
  const monthLine: L | null =
    prevMonth && lastMonth
      ? both((l) => {
          const names = l === "lv" ? LV_MONTHS : EN_MONTHS;
          const a = `${names[Number(prevMonth.month.slice(5)) - 1]} ${hours(prevMonth.minutes, l)} h`;
          const b = `${names[Number(lastMonth.month.slice(5)) - 1].toLocaleLowerCase(l === "lv" ? "lv-LV" : "en")} ${hours(lastMonth.minutes, l)} h`;
          const ratio = lastMonth.minutes / Math.max(prevMonth.minutes, 1);
          const trend =
            ratio > 1.05
              ? l === "lv" ? "slodze aug" : "the load is growing"
              : ratio < 0.95
                ? l === "lv" ? "slodze samazinās" : "the load is easing"
                : l === "lv" ? "slodze stabila" : "the load is steady";
          return `${a}, ${b}: ${trend}`;
        })
      : null;

  const topCategory = s.topCategory;
  const ownerExamples: L[] = [
    both((l) =>
      l === "lv"
        ? `Pieci lielākie klienti aizņem ${s.top5ClientsPct}% no visa komandas laika`
        : `The five largest clients take up ${s.top5ClientsPct}% of all team time`,
    ),
    both((l) =>
      l === "lv"
        ? `Lielākais klients: ${hours(s.largestClientMinutes, l)} stundas, nākamais ${hours(s.secondClientMinutes, l)}`
        : `The largest client: ${hours(s.largestClientMinutes, l)} hours, the next ${hours(s.secondClientMinutes, l)}`,
    ),
    both((l) =>
      l === "lv"
        ? `Tipiskais klients: ${hours(s.medianClientMinutes, l)} stundas kopš pilota sākuma`
        : `A typical client: ${hours(s.medianClientMinutes, l)} hours since the pilot began`,
    ),
    both((l) =>
      l === "lv"
        ? `${s.clientsUnder1h} klienti zem vienas stundas, ${s.clientsOver10h} klienti virs desmit`
        : `${s.clientsUnder1h} clients under one hour, ${s.clientsOver10h} clients over ten`,
    ),
    ...(topCategory
      ? [
          both((l) =>
            l === "lv"
              ? `${topCategory.label}: ${topCategory.entries} ieraksti, ${hours(topCategory.minutes, l)} stundas kopā`
              : `${topCategory.label}: ${topCategory.entries} entries, ${hours(topCategory.minutes, l)} hours in total`,
          ),
        ]
      : []),
    both((l) =>
      l === "lv"
        ? `${s.under15Pct}% ierakstu ir īsāki par 15 minūtēm, tieši tie, ko neviens neuzskaita`
        : `${s.under15Pct}% of entries are under 15 minutes, exactly the ones nobody counts`,
    ),
  ];

  return [
    {
      name: { lv: "Darbiniekiem", en: "For employees" },
      desc: {
        lv: "Vienkārša darba fiksēšana bez papildu kontroles: 30 sekundes dienā, un darbinieks pats izlemj, ko iesniegt",
        en: "Simple logging with no extra oversight: 30 seconds a day, and the employee decides what to submit",
      },
      why: {
        lv: "Kad klients atsūta nepilnus dokumentus, kavē atbildes vai jautā vienu un to pašu, šīs stundas nekur neparādās. Kad darbs kavējas, redzams tikai kavējums, nevis iemesls. Shadowy ļauj to pierakstīt pie konkrētā klienta, un tas neizklausās pēc attaisnošanās",
        en: "When a client sends incomplete documents, answers late or asks the same thing again, those hours show up nowhere. When work runs late, only the delay is visible, not the reason. Shadowy lets you note it against that client, and it doesn't sound like an excuse",
      },
      examples: employeeExamples,
      figures: [
        s.returned === 0
          ? { value: "100%", label: { lv: "ierakstu apstiprināti, neviens nav atgriezts", en: "of entries approved, none returned" } }
          : {
              value: `${Math.round(((s.entries) / (s.entries + s.returned)) * 100)}%`,
              label: { lv: "ierakstu apstiprināti", en: "of entries approved" },
            },
        { value: `${s.helpPct}%`, label: { lv: "no visa fiksētā laika bija palīdzība kolēģiem", en: "of all logged time was helping colleagues" } },
        { value: `${s.topHelperSharePct}%`, label: { lv: "tās palīdzības veica viens cilvēks", en: "of that help was done by one person" } },
        { value: `${hours(s.helpMinutes, "lv")} h`, label: { lv: "palīdzības kolēģiem kopš pilota sākuma", en: "of help to colleagues since the pilot began" } },
        { value: `${s.medianEntryMinutes} min`, label: { lv: "ilgst tipisks ieraksts", en: "is a typical entry" } },
        { value: `${s.under15Pct}%`, label: { lv: "ierakstu īsāki par 15 minūtēm", en: "of entries shorter than 15 minutes" } },
      ],
      figuresNote: {
        lv: `${source.lv}: ${s.entries} ieraksti, ${s.people} cilvēku komanda, ${hours(s.totalMinutes, "lv")} fiksētas stundas`,
        en: `${source.en}: ${s.entries} entries, a team of ${s.people}, ${hours(s.totalMinutes, "en")} logged hours`,
      },
      helpFlow:
        s.helpFlow.length > 0
          ? {
              edges: s.helpFlow.map((edge, index) => ({
                to: {
                  lv: `Kolēģis ${String.fromCharCode(65 + index)}`,
                  en: `Colleague ${String.fromCharCode(65 + index)}`,
                },
                times: edge.times,
                minutes: edge.minutes,
                topCategory: edge.topCategory,
              })),
              helperEntries: s.topHelperEntries,
              allEntries: s.helpEntries,
              note: {
                lv: `${source.lv} Kolēģi apzīmēti ar burtiem, jo nozīme ir slodzes sadalījumam, nevis konkrētiem cilvēkiem.`,
                en: `${source.en}. Colleagues are lettered because what matters is how the load is distributed, not the individuals.`,
              },
            }
          : undefined,
      image: {
        src: "/images/pic11.webp",
        width: 1672,
        height: 941,
        alt: "Darbinieka skats Shadowy: iesniegtie ieraksti, apstiprinātās stundas un sadalījums pa kategorijām",
        caption: { lv: "Darbinieka skats. Ekrānattēlā demonstrācijas dati", en: "Employee view. The screen shows demo data" },
      },
      link: { label: { lv: "Ko fiksēt un ko nē", en: "What to log and what not to" }, href: "#ko-fikset" },
    },
    {
      name: { lv: "Vadītājiem", en: "For managers" },
      desc: {
        lv: "Komandas slodze pa klientiem: apstipriniet ierakstus un redziet, kuri klienti un procesi atkārtojas",
        en: "Your team's workload by client: approve entries and see which clients and processes keep coming back",
      },
      why: {
        lv: "Klientus sadala pēc līguma, bet darba apjomu nosaka tas, kā klients patiesībā sadarbojas. Tāpēc plāns nesanāk, un iemesls nav redzams nevienā atskaitē. Vadītājs redz divas lietas, kuras citādi nav no kā paņemt: kurš process pie kura klienta atkārtojas tik bieži, ka to ir lētāk salabot nekā izturēt, un kur darbs jāpārdala, lai slodze komandā būtu vienmērīgāka",
        en: "Clients are assigned by contract, but the amount of work depends on how each client really works with you. So the plan doesn't hold, and the reason shows up in no report. A manager sees two things there's otherwise nowhere to get: which process repeats with which client often enough that fixing it is cheaper than enduring it, and where work should be redistributed so the load is more even",
      },
      examples: [
        both((l) =>
          l === "lv"
            ? `${s.recurringProcesses} atkārtojušies procesi: viena un tā pati kategorija pie viena klienta trīs un vairāk reizes`
            : `${s.recurringProcesses} recurring processes: the same category with the same client three or more times`,
        ),
        both((l) =>
          l === "lv"
            ? `Trīs cilvēki nes ${s.top3PeoplePct}% no visa fiksētā laika, pārējie ${others} pārējo`
            : `Three people carry ${s.top3PeoplePct}% of all logged time, the other ${others} the rest`,
        ),
        both((l) =>
          l === "lv"
            ? `Noslogotākajam ${hours(s.busiestPersonMinutes, l)} stundas, viszemākajam ${hours(s.quietestPersonMinutes, l)}, vienā un tajā pašā komandā`
            : `The busiest has ${hours(s.busiestPersonMinutes, l)} hours, the lowest ${hours(s.quietestPersonMinutes, l)}, in the same team`,
        ),
        ...(monthLine ? [monthLine] : []),
      ],
      figures: [
        { value: `${s.recurringEntriesPct}%`, label: { lv: "ierakstu ietilpst darbā, kas atkārtojas", en: "of entries fall into work that repeats" } },
        { value: String(s.recurringProcesses), label: { lv: "atkārtoti procesi, ko var labot pa vienam", en: "recurring processes you can fix one by one" } },
        {
          value: `${s.top3PeoplePct}%`,
          label: {
            lv: `no visām stundām nostrādāja 3 no ${s.people} komandas cilvēkiem`,
            en: `of all hours were worked by 3 of the team's ${s.people} people`,
          },
        },
        { value: `${s.top1PersonPct}%`, label: { lv: "no visām stundām nostrādāja viens komandas cilvēks", en: "of all hours were worked by one person on the team" } },
        { value: String(s.entries), label: { lv: "apstiprināti ieraksti kopš pilota sākuma", en: "approved entries since the pilot began" } },
        { value: `${s.avgEntryMinutes} min`, label: { lv: "vidējais ieraksts", en: "average entry" } },
      ],
      figuresNote: {
        lv: `${source.lv}, ${s.entries} ieraksti no ${s.people} cilvēkiem. "Atkārtojas" nozīmē vienu kategoriju pie viena klienta trīs un vairāk reizes: tieši tur meklējams process, nevis atsevišķs gadījums`,
        en: `${source.en}, ${s.entries} entries from ${s.people} people. "Repeats" means one category with one client three or more times: that's where a process is, not a one-off`,
      },
      link: { label: { lv: "Kā notiek izskatīšana", en: "How the review works" }, href: "#process" },
    },
    {
      name: { lv: "Biroja vadībai", en: "For the firm's owner" },
      desc: {
        lv: "Katra klienta stundas, pašizmaksa un rentabilitāte vienā pārskatā",
        en: "Each client's hours, cost and profitability in one overview",
      },
      why: {
        lv: "Ar fiksētu maksu klients var būt nerentabls mēnešiem, un to pamana gada beigās, ja vispār. Kad komandas laiks ir piesaistīts klientam un reizināts ar stundas likmi, pārsniegums redzams tajā pašā mēnesī. Redzams arī, cik nevienmērīgi portfelis patiesībā ir sadalīts un kuriem klientiem jāpārskata cena",
        en: "On a fixed fee a client can be unprofitable for months, and it is noticed at year end, if at all. When the team's time is tied to a client and multiplied by an hourly rate, the overrun shows in the same month. You also see how unevenly the portfolio is really split and which clients need a new price",
      },
      examples: ownerExamples,
      figures: [
        { value: String(s.clients), label: { lv: "klienti ar ierakstiem kopš pilota sākuma", en: "clients with entries since the pilot began" } },
        { value: `${s.top5ClientsPct}%`, label: { lv: "no visām stundām aizgāja 5 lielākajiem klientiem", en: "of all hours went to the 5 largest clients" } },
        {
          value: `${hours(s.largestClientMinutes, "lv")} h`,
          label: {
            lv: `aizgāja lielākajam klientam. Tipiskam klientam ${hours(s.medianClientMinutes, "lv")} h`,
            en: `went to the largest client. A typical client: ${hours(s.medianClientMinutes, "en")} h`,
          },
        },
        { value: String(s.clientsOver10h), label: { lv: "klientiem katram aizgāja vairāk nekā 10 stundas", en: "clients each took more than 10 hours" } },
        { value: String(s.clientsUnder1h), label: { lv: "klientiem pietika ar mazāk nekā 1 stundu", en: "clients needed less than 1 hour" } },
        { value: `${hours(s.totalMinutes, "lv")} h`, label: { lv: "kopā, katra piesaistīta konkrētam klientam", en: "in total, each tied to a specific client" } },
      ],
      figuresNote: {
        lv: `${source.lv} Kad šīs stundas ir piesaistītas klientam un reizinātas ar komandas stundas likmi, kļūst redzams, kurš klients ar fiksētu maksu nesedz savu darbu`,
        en: `${source.en}. When these hours are tied to a client and multiplied by the team's hourly rate, it becomes clear which fixed-fee client doesn't cover its own work`,
      },
      image: {
        src: "/images/shadowy-dashboard-wide.png",
        width: 1916,
        height: 821,
        alt: "Shadowy organizācijas pārskats: klientiem veltītās stundas, darba pašizmaksa un limita pārsniegums",
        caption: {
          lv: "Organizācijas pārskats. Klientu nosaukumi un summas ir izdomāts piemērs",
          en: "Organisation overview. Client names and amounts are an illustrative example",
        },
      },
      link: { label: { lv: "Skatīt reālu projektu", en: "See a real project" }, href: "/projekti/pb-finanses" },
    },
    DATA_SAFETY,
  ];
}

const DATA_SAFETY: Audience = {
  name: { lv: "Datu drošībai", en: "For data safety" },
  desc: {
    lv: "Vadītājiem pieejami tikai savas komandas ieraksti, administratoriem savas organizācijas dati. Nekas vairāk",
    en: "Managers can only access their own team's entries, administrators only their organisation's data. Nothing more",
  },
  why: {
    lv: "Ja komanda uztver rīku kā novērošanu, tā to neizmanto, un dati ir bezvērtīgi. Tāpēc redzamība ir ierobežota pēc lomas, un darbinieks pats izlemj, kas nonāk sistēmā",
    en: "If a team sees the tool as surveillance, they won't use it, and the data is worthless. So visibility is limited by role, and the employee decides what goes into the system",
  },
  examples: [
    { lv: "Vadītājs redz savas komandas apstiprinātos ierakstus, ne citu komandu", en: "A manager sees their own team's approved entries, not other teams'" },
    { lv: "Ekrāna aktivitāte, taustiņi un privātas sarunas netiek fiksētas vispār", en: "Screen activity, keystrokes and private conversations are not logged at all" },
    { lv: "AI veido tikai melnrakstu. Nekas netiek saglabāts bez darbinieka apstiprinājuma", en: "The AI only makes a draft. Nothing is saved without the employee's approval" },
    { lv: "Pēc pilota datus var eksportēt, un pēc glabāšanas perioda tie tiek dzēsti", en: "After the pilot the data can be exported, and after the retention period it is deleted" },
  ],
  link: { label: { lv: "Privātuma politika", en: "Privacy policy" }, href: "/privacy" },
};

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

function HelpFlow({ data }: { data: NonNullable<Audience["helpFlow"]> }) {
  const flow = data.edges;
  const { locale } = useLocale();
  const maxMinutes = Math.max(...flow.map((edge) => edge.minutes));
  const totalMinutes = flow.reduce((sum, edge) => sum + edge.minutes, 0);
  const toHours = (minutes: number) =>
    (minutes / 60).toFixed(1).replace(".", locale === "lv" ? "," : ".");

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
                Viens cilvēks komandā fiksēja {data.helperEntries} no {data.allEntries} palīdzības
                ierakstiem: {toHours(totalMinutes)} stundas {flow.length} kolēģiem. Neviena
                iepriekšējā atskaite to nerādīja.
              </>
            ) : (
              <>
                One person on the team logged {data.helperEntries} of {data.allEntries} help
                entries: {toHours(totalMinutes)} hours for {flow.length} colleagues. No
                previous report showed it.
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
                {edge.times}× · {toHours(edge.minutes)} h
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-xs font-medium leading-relaxed text-black/45">
        {data.note[locale]}
      </p>
    </div>
  );
}

export function LandingAudience({ stats }: { stats: PilotStats }) {
  const { locale, t } = useLocale();
  const audiences = React.useMemo(() => buildAudiences(stats), [stats]);
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
          {audiences.map((audience) => {
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
                  inert={!isOpen ? true : undefined}
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

                  {audience.helpFlow && <HelpFlow data={audience.helpFlow} />}
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
