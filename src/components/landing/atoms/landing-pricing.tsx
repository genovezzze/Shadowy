"use client";

import Link from "next/link";
import * as React from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Diamond, Sparkles } from "lucide-react";
import { Reveal } from "@/components/landing/atoms/landing-primitives";
import { WaveHeading } from "@/components/landing/atoms/wave-heading";
import { useLocale, type Locale } from "@/components/landing/atoms/i18n";
import { cn } from "@/lib/utils";

type L = Record<Locale, string>;

type Tier = {
  id: string;
  name: L;
  price: L;
  priceNote: L;
  description: L;
  features: L[];
  cta: L;
  href: string;
  /** 0 = pilot, 1 = standard, 2 = premium: how much the slab has grown. */
  stage: 0 | 1 | 2;
  popular?: boolean;
  sparkles?: boolean;
};

// One price per firm, not per seat: a small office owner says yes to one clear
// number. Each plan carries the landing's line-art slab, growing with the plan:
// a thin flat sheet, a slab with a gentle wave, a taller slab with more relief.
const TIERS: Tier[] = [
  {
    id: "pilots",
    name: { lv: "Pilots", en: "Pilot" },
    price: { lv: "0 €", en: "€0" },
    priceNote: { lv: "30 dienas, bez saistībām", en: "30 days, no commitment" },
    description: {
      lv: "Viss, kas ir Standartā, 30 dienas bez maksas. Izmēģiniet uz saviem klientiem.",
      en: "Everything in Standard, free for 30 days. Try it on your own clients.",
    },
    features: [
      { lv: "Viss, kas ir Standartā", en: "Everything in Standard" },
      { lv: "Visa komanda no pirmās dienas", en: "The whole team from day one" },
      { lv: "Mēs iestatām kontu un klientu sarakstu", en: "We set up the account and client list" },
      { lv: "Apmācība darbiniekiem 10 minūtēs", en: "10-minute training for the team" },
      { lv: "Pēc 30 dienām atskaite par katru klientu", en: "A report on every client after 30 days" },
    ],
    cta: { lv: "Pieteikties pilotam", en: "Apply for the pilot" },
    href: "#pilots",
    stage: 0,
  },
  {
    id: "standarts",
    name: { lv: "Standarts", en: "Standard" },
    price: { lv: "49 €", en: "€49" },
    priceNote: { lv: "mēnesī par visu biroju", en: "per month for the whole firm" },
    description: {
      lv: "Viss, lai redzētu katra klienta stundas, pašizmaksu un papildu darba iemeslus.",
      en: "Everything to see each client's hours, true cost and the reasons for extra work.",
    },
    features: [
      { lv: "Visa komanda, bez maksas par darbinieku", en: "The whole team, no per-seat fee" },
      { lv: "Ieraksti ar balsi vai tekstu, AI melnraksti", en: "Entries by voice or text, AI drafts" },
      { lv: "Stundas un pašizmaksa pa klientiem", en: "Hours and cost by client" },
      { lv: "Klienta atskaite sarunai par cenu", en: "Client report for the pricing talk" },
      { lv: "Dati glabājas un tiek apstrādāti ES", en: "Data stored and processed in the EU" },
      { lv: "Atbalsts latviski", en: "Support in Latvian" },
    ],
    cta: { lv: "Sākt ar pilotu", en: "Start with the pilot" },
    href: "#pilots",
    stage: 1,
    popular: true,
  },
  {
    id: "premium",
    name: { lv: "Premium", en: "Premium" },
    price: { lv: "Individuāli", en: "Custom" },
    priceNote: { lv: "pēc vienošanās", en: "by agreement" },
    description: {
      lv: "No darbinieku ierakstiem redzam, kuri procesi atkārtojas visbiežāk un ko var automatizēt, lai darbs ietu ātrāk.",
      en: "From what the team logs we see which processes repeat most and what can be automated to get work done faster.",
    },
    features: [
      { lv: "Viss, kas ir Standartā", en: "Everything in Standard" },
      { lv: "Atkārtoto procesu analīze", en: "Analysis of recurring processes" },
      { lv: "Ieteikumi, ko automatizēt", en: "Recommendations on what to automate" },
      { lv: "Paplašināta darba slodzes analītika", en: "Extended workload analytics" },
      { lv: "Kategorijas un atskaites pēc jūsu biroja", en: "Categories and reports shaped to your firm" },
      { lv: "Ikmēneša saruna un prioritārs atbalsts", en: "A monthly review and priority support" },
    ],
    cta: { lv: "Sazināties", en: "Get in touch" },
    href: "mailto:contact@shadowy.lv?subject=Shadowy%20Premium",
    stage: 2,
    sparkles: true,
  },
];

// Isometric line-art blocks, the same drawing language as the landing's slabs:
// one block for the pilot, a small step of three for Standard, a pyramid of
// six for Premium. On card hover the blocks spread sideways, away from each other
// (variants ride on the card's own "hover" state).
type Block = [number, number, number]; // grid x, grid y, level
const BLOCKS: Record<0 | 1 | 2, Block[]> = {
  0: [[0, 0, 0]],
  1: [[1, 0, 0], [0, 0, 0], [0, 0, 1]],
  2: [[1, 1, 0], [1, 0, 0], [0, 1, 0], [0, 0, 0], [1, 0, 1], [0, 0, 1]],
};

function PlanArt({ stage, still }: { stage: 0 | 1 | 2; still: boolean }) {
  const blocks = BLOCKS[stage];
  const W = 120;
  const H = 100;
  const a = 15; // block edge
  const COS = Math.cos(Math.PI / 6);
  const pt = (x: number, y: number, z: number) => [W / 2 + (x - y) * COS * a, 62 + (x + y) * 0.5 * a - z * a] as const;
  const poly = (pts: (readonly [number, number])[]) =>
    pts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`).join("") + "Z";
  // Draw back to front so nearer blocks cover farther ones.
  const ordered = [...blocks].sort((p, q) => p[0] + p[1] - (q[0] + q[1]) || p[2] - q[2]);
  const top = Math.max(...blocks.map((b) => b[2]));
  const centres = blocks.map(([x, y, z]) => pt(x, y, z + 0.5));
  const cx = centres.reduce((sum, c) => sum + c[0], 0) / centres.length;
  const cy = centres.reduce((sum, c) => sum + c[1], 0) / centres.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-20 w-24 shrink-0 overflow-visible text-black md:h-24 md:w-28" aria-hidden>
      {ordered.map(([x, y, z], i) => {
        const x0 = x - 0.5;
        const y0 = y - 0.5;
        const topFace = poly([pt(x0, y0, z + 1), pt(x0 + 1, y0, z + 1), pt(x0 + 1, y0 + 1, z + 1), pt(x0, y0 + 1, z + 1)]);
        const left = poly([pt(x0, y0 + 1, z + 1), pt(x0 + 1, y0 + 1, z + 1), pt(x0 + 1, y0 + 1, z), pt(x0, y0 + 1, z)]);
        const right = poly([pt(x0 + 1, y0, z + 1), pt(x0 + 1, y0 + 1, z + 1), pt(x0 + 1, y0 + 1, z), pt(x0 + 1, y0, z)]);
        const crown = z === top && i === ordered.length - 1;
        // Push each block away from the cluster's centre on screen, so the
        // stack spreads sideways; a lone block just steps up.
        const [bx, by] = pt(x, y, z + 0.5);
        const dx = bx - cx;
        const dy = by - cy;
        const len = Math.hypot(dx, dy);
        const spread = len < 0.5 ? { x: 0, y: -5 } : { x: (dx / len) * 9, y: (dy / len) * 6 };
        return (
          <motion.g
            key={`${x}${y}${z}`}
            variants={
              still
                ? undefined
                : {
                    initial: { x: 0, y: 0 },
                    hover: { ...spread, transition: { type: "spring", stiffness: 260, damping: 15, delay: i * 0.03 } },
                  }
            }
          >
            <path d={left} fill="#ffffff" stroke="currentColor" strokeWidth={0.9} strokeOpacity={0.7} />
            <path d={right} fill="#f1f1f1" stroke="currentColor" strokeWidth={0.9} strokeOpacity={0.7} />
            <path d={topFace} fill={crown ? "#8fa1b6" : "#ffffff"} stroke="currentColor" strokeWidth={0.9} strokeOpacity={0.75} />
          </motion.g>
        );
      })}
    </svg>
  );
}

// Counts the number inside a price ("49 €", "€49") up from zero the first time
// it scrolls into view. Prices without a number ("Individuāli") stay as they are.
function CountUp({ text, still }: { text: string; still: boolean }) {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const match = text.match(/\d+/);
  const target = match ? Number(match[0]) : 0;
  const hasNumber = match !== null;
  const [value, setValue] = React.useState(still || !hasNumber ? target : 0);

  React.useEffect(() => {
    if (!hasNumber || still || !inView) return;
    const duration = 1100;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, still, target, hasNumber]);

  if (!match) return <span>{text}</span>;
  return (
    <span ref={ref} className="tabular-nums">
      {text.slice(0, match.index)}
      {value}
      {text.slice((match.index ?? 0) + match[0].length)}
    </span>
  );
}

const cardVariants = {
  initial: { scale: 1, y: 0 },
  hover: { scale: 1.03, y: -5, transition: { type: "spring" as const, stiffness: 300, damping: 20 } },
};

function PricingCard({ tier, locale, still }: { tier: Tier; locale: Locale; still: boolean }) {
  const Icon = tier.sparkles ? Sparkles : Diamond;
  return (
    <motion.article
      variants={still ? undefined : cardVariants}
      initial="initial"
      whileHover="hover"
      className={cn(
        "relative flex h-full flex-col justify-between rounded-2xl border bg-white p-6 transition-shadow duration-300 hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.18)] md:p-7",
        tier.popular ? "border-black" : "border-black/10",
      )}
    >
      {tier.popular ? (
        <span className="absolute -top-3 left-6 rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
          {locale === "lv" ? "Populārākais" : "Most popular"}
        </span>
      ) : null}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-black">{tier.name[locale]}</h3>
            <p className="mt-2 whitespace-nowrap text-4xl font-bold tracking-tight text-black"><CountUp text={tier.price[locale]} still={still} /></p>
            <p className="text-sm text-black/55">{tier.priceNote[locale]}</p>
          </div>
          <PlanArt stage={tier.stage} still={still} />
        </div>
        <p className="text-black/60">{tier.description[locale]}</p>
        <ul className="space-y-2.5 pt-2">
          {tier.features.map((feature) => (
            <li key={feature.lv} className="flex items-center gap-2.5 text-sm text-black/80">
              <Icon className="size-4 shrink-0 text-[#2563eb]" aria-hidden />
              <span>{feature[locale]}</span>
            </li>
          ))}
        </ul>
      </div>
      <Link
        href={tier.href}
        className={cn(
          "mt-7 inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold transition-colors",
          tier.popular ? "bg-black text-white hover:bg-black/85" : "bg-black/[0.06] text-black hover:bg-black/[0.1]",
        )}
      >
        {tier.cta[locale]}
      </Link>
    </motion.article>
  );
}

export function LandingPricing() {
  const { locale } = useLocale();
  const still = useReducedMotion() ?? false;

  return (
    <section id="cenas" className="relative scroll-mt-20 bg-[var(--landing-paper)] pb-16 pt-8 md:pb-32 md:pt-12">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        <Reveal className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#2563eb]">
            {locale === "lv" ? "Cenas" : "Pricing"}
          </p>
          <h2 className="text-landing-h2 mt-2 text-black [&_.inline-flex.flex-wrap]:justify-center">
            <WaveHeading tone="dark">
              {locale === "lv" ? "Skaidra cena, bez pārsteigumiem" : "Clear pricing, no surprises"}
            </WaveHeading>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-relaxed text-black/55 md:text-base">
            {locale === "lv"
              ? "Viena cena visam birojam. Sāciet ar 30 dienu pilotu bez maksas, pārtraukt var jebkurā mēnesī."
              : "One price for the whole firm. Start with a free 30-day pilot and cancel in any month."}
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {TIERS.map((tier, index) => (
            <Reveal key={tier.id} delay={0.05 * index} className={cn(index === 2 && "md:col-span-2 lg:col-span-1")}>
              <PricingCard tier={tier} locale={locale} still={still} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8">
          <div className="rounded-2xl border border-black/10 bg-white p-6 md:flex md:items-center md:justify-between md:gap-8 md:p-7">
            <div>
              <h3 className="text-xl font-semibold text-black">
                {locale === "lv" ? "Īpašs pieprasījums" : "Special request"}
              </h3>
              <p className="mt-2 max-w-2xl text-black/60">
                {locale === "lv"
                  ? "Jums vajag kaut ko īpašu, piemēram, vairākus birojus vai savu atskaišu formu? Uzrakstiet, un kopā izdomāsim risinājumu."
                  : "Need something specific, like several offices or your own report format? Write to us and we'll work it out together."}
              </p>
            </div>
            <Link
              href="mailto:contact@shadowy.lv?subject=Shadowy%20piepras%C4%ABjums"
              className="mt-6 inline-flex h-11 w-full shrink-0 items-center justify-center rounded-full bg-black px-8 text-sm font-semibold text-white transition-colors hover:bg-black/85 md:mt-0 md:w-auto"
            >
              {locale === "lv" ? "Parunāsim" : "Let's talk"}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
