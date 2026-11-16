"use client";

import * as React from "react";
import { BarChart3, BrainCircuit, Check, Layers, Mic, type LucideIcon } from "lucide-react";
import { useLocale, type Locale } from "@/components/landing/atoms/i18n";
import { cn } from "@/lib/utils";

type L = Record<Locale, string>;

type Step = { icon: LucideIcon; tint: string; title: L; text: L };

// Muted tints for the icon tiles, one per step, so the list reads as a set
// rather than a row of identical bullets.
const STEPS: Step[] = [
  {
    icon: Mic,
    tint: "#d6cec4",
    title: { lv: "Darbinieks fiksē", en: "The employee logs it" },
    text: {
      lv: "30 sekundēs ar balsi vai tekstu ieraksta, pie kura klienta strādāja un ko darīja",
      en: "In 30 seconds, by voice or text, they note which client they worked on and what they did",
    },
  },
  {
    icon: BrainCircuit,
    tint: "#8fa1b6",
    title: { lv: "AI sagatavo melnrakstu", en: "AI prepares a draft" },
    text: {
      lv: "No brīva teikuma top ieraksts ar klientu, kategoriju un laiku. Bez darbinieka apstiprinājuma nekas netiek saglabāts",
      en: "A free sentence becomes an entry with client, category and time. Nothing is saved without the employee's approval",
    },
  },
  {
    icon: Check,
    tint: "#a5b3a6",
    title: { lv: "Vadītājs izvērtē", en: "The manager reviews" },
    text: {
      lv: "Vadītājs redz komandas ierakstus, apstiprina tos vai atgriež precizēšanai",
      en: "The manager sees the team's entries and approves them or returns them for clarification",
    },
  },
  {
    icon: Layers,
    tint: "#c4b6c6",
    title: { lv: "Dati sakārtojas", en: "The data falls into place" },
    text: {
      lv: "Ieraksti sakārtojas pa klientiem un darba veidiem, un atkārtotie iemesli kļūst redzami",
      en: "Entries fall into place by client and type of work, and recurring reasons become visible",
    },
  },
  {
    icon: BarChart3,
    tint: "#b3c0cc",
    title: { lv: "Birojs redz pašizmaksu", en: "The firm sees the cost" },
    text: {
      lv: "Stundas, izmaksas un iemesli pa klientiem vienā pārskatā, ko var likt uz galda sarunā par cenu",
      en: "Hours, cost and reasons by client in one overview you can bring to the pricing conversation",
    },
  },
];

// Geometry of the art box (px). The stack and the circles share one box so a
// sheet can morph into its circle in place.
const BOX_W = 360;
const BOX_H = 440;
const SHEET_W = 250;
const SHEET_H = 172;
const CIRCLE_D = 190;
const RING_R = 80;

function circleCentre(index: number) {
  // Five circles on a pentagon, first one at the top, overlapping like a Venn.
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / STEPS.length;
  return { x: BOX_W / 2 + RING_R * Math.cos(angle), y: BOX_H / 2 + 10 + RING_R * Math.sin(angle) };
}

/**
 * One shape per step. On the first step they lie as an exploded stack of
 * sheets; from the second step on each sheet morphs into an overlapping
 * circle, and the circle of the step being read fills and gets an outline.
 */
function StepArt({ active }: { active: number }) {
  const circles = active > 0;
  return (
    <div
      className="relative origin-top [perspective:1100px]"
      style={{ width: BOX_W, height: BOX_H }}
      aria-hidden
    >
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === active;
        const c = circleCentre(index);
        const shape: React.CSSProperties = circles
          ? {
              left: c.x - CIRCLE_D / 2,
              top: c.y - CIRCLE_D / 2,
              width: CIRCLE_D,
              height: CIRCLE_D,
              borderRadius: 9999,
              transform: "none",
              zIndex: isActive ? 10 : 1,
            }
          : {
              left: BOX_W / 2 - SHEET_W / 2,
              top: 40 + index * 62 + (isActive ? -10 : 0),
              width: SHEET_W,
              height: SHEET_H,
              borderRadius: 16,
              transform: "rotateX(58deg) rotateZ(-38deg)",
              zIndex: STEPS.length - index,
            };
        return (
          <div
            key={step.title.lv}
            className={cn(
              "absolute grid place-items-center border",
              isActive
                ? circles
                  ? "border-black/70 bg-[#eef1f4]/55"
                  : "border-black/70 bg-[#eef1f4]/90 shadow-[0_24px_40px_-28px_rgba(0,0,0,0.45)]"
                : circles
                  ? "border-black/15 bg-transparent"
                  : "border-black/15 bg-white/55",
            )}
            style={{
              ...shape,
              transition:
                "left 700ms cubic-bezier(0.22,1,0.36,1), top 700ms cubic-bezier(0.22,1,0.36,1), width 700ms cubic-bezier(0.22,1,0.36,1), height 700ms cubic-bezier(0.22,1,0.36,1), border-radius 700ms cubic-bezier(0.22,1,0.36,1), transform 700ms cubic-bezier(0.22,1,0.36,1), background-color 500ms, border-color 500ms",
            }}
          >
            <span
              className={cn(
                "grid size-10 place-items-center rounded-lg border transition-colors duration-500",
                isActive ? "border-black/60 text-white" : "border-black/70 bg-white text-black",
                !circles && !isActive && "border-dashed",
              )}
              style={isActive ? { backgroundColor: step.tint } : undefined}
            >
              <Icon className="size-4" strokeWidth={2.2} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function LandingApproach() {
  const { locale } = useLocale();
  const [active, setActive] = React.useState(0);
  const itemRefs = React.useRef<(HTMLLIElement | null)[]>([]);

  // The step crossing the middle band of the screen is the one being read.
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(index)) setActive(index);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="process" className="relative scroll-mt-20 bg-[var(--landing-paper)] px-4 py-16 md:px-8 md:py-28 xl:px-24">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:self-start">
          <p className="text-xs font-semibold text-black/50">{locale === "lv" ? "Kā tas notiek" : "How it works"}</p>
          <h2 className="mt-4 text-[clamp(2.2rem,4.4vw,3.6rem)] font-light leading-[1.08] tracking-tight text-black">
            {locale === "lv" ? (
              <>
                Pieci soļi.
                <br />
                Viena pašizmaksa.
              </>
            ) : (
              <>
                Five steps.
                <br />
                One true cost.
              </>
            )}
          </h2>
          <p className="mt-4 text-sm text-black/55 md:text-base">
            {locale === "lv"
              ? "No 30 sekunžu ieraksta līdz katra klienta pašizmaksai"
              : "From a 30-second entry to the true cost of every client"}
          </p>
          {/* Phones read the steps as a plain list: the art only works beside it. */}
          <div className="mt-10 hidden items-center justify-center lg:mt-4 lg:flex lg:h-[calc(100%-11rem)]">
            <StepArt active={active} />
          </div>
        </div>

        <div>
        {/* Phones: the art sits above the steps and stays in place (it does
            not follow the scroll). */}
        <div className="flex h-[250px] items-start justify-center overflow-hidden lg:hidden">
          <div className="origin-top scale-[0.55]">
            <StepArt active={active} />
          </div>
        </div>
        <ol className="lg:pt-[18vh]">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === active;
            return (
              <li
                key={step.title.lv}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                data-index={index}
                className={cn(
                  "border-b border-black/10 py-7 transition-opacity duration-500 last:border-b-0 md:py-16",
                  isActive ? "opacity-100" : "opacity-35",
                )}
              >
                <span
                  className="grid size-9 place-items-center rounded-lg text-white"
                  style={{ backgroundColor: step.tint }}
                  aria-hidden
                >
                  <Icon className="size-4" strokeWidth={2.2} />
                </span>
                <h3 className="mt-6 text-[1.7rem] font-light leading-tight tracking-tight text-black md:text-[2rem]">
                  {step.title[locale]}
                </h3>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-black/60">{step.text[locale]}</p>
              </li>
            );
          })}
        </ol>
        </div>
      </div>
    </section>
  );
}
