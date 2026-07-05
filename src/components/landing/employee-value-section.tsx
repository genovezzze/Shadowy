"use client";

import { motion } from "framer-motion";
import { BellOff, Eye, Layers, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const cards = [
  {
    icon: BellOff,
    title: "Mazāk lieku pārtraukumu",
    text: "Shadowy palīdz parādīt, kas traucē paveikt pamatdarbu ātrāk.",
  },
  {
    icon: Eye,
    title: "Redzams papildu ieguldījums",
    text: "Palīdzība kolēģiem, onboarding un koordinācija vairs nepaliek neredzama.",
  },
  {
    icon: Layers,
    title: "Skaidrākas atbildības",
    text: "Dati palīdz saprast, kur darbinieks regulāri dara darbu ārpus savas lomas.",
  },
  {
    icon: Zap,
    title: "Mazāk haosa komandā",
    text: "Atkārtoti jautājumi un gaidīšana kļūst redzami, lai tos varētu samazināt.",
  },
] as const;

function FeatureCard({
  icon: Icon,
  title,
  text,
  index,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
  index: number;
}) {
  const isTopRow = index < 2;
  return (
    <div
      className={cn(
        "group/card relative flex flex-col py-5 px-5 sm:py-8 sm:px-7 border-white/[0.08]",
        // Mobile (1 col): bottom border between items
        index < 3 && "border-b",
        // SM+ override: remove bottom border from bottom row
        index >= 2 && "sm:border-b-0",
        // SM+ top row gets bottom border
        isTopRow && "sm:border-b",
        // SM+ right border except last
        index < cards.length - 1 && "sm:border-r",
        // SM+ left border for left column
        index % 2 === 0 && "sm:border-l",
      )}
    >
      {/* hover gradient */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100",
          isTopRow
            ? "bg-gradient-to-t from-white/[0.04] to-transparent"
            : "bg-gradient-to-b from-white/[0.04] to-transparent",
        )}
      />

      {/* icon */}
      <div className="relative mb-4 text-emerald-300 sm:mb-5">
        <Icon className="size-5 sm:size-6" strokeWidth={1.6} aria-hidden />
      </div>

      {/* title with animated left bar */}
      <div className="relative mb-2.5">
        <div className="absolute -left-5 sm:-left-7 inset-y-0 w-[3px] rounded-r-full bg-white/10 transition-all duration-200 h-5 group-hover/card:h-7 group-hover/card:bg-emerald-300" />
        <h3 className="relative font-accent text-sm font-bold leading-snug tracking-[0.015em] text-white transition-transform duration-200 group-hover/card:translate-x-1 [font-synthesis:weight] sm:text-base lg:text-lg">
          {title}
        </h3>
      </div>

      {/* text */}
      <p className="relative font-accent text-sm font-light leading-relaxed text-white/50">
        {text}
      </p>
    </div>
  );
}

export function EmployeeValueSection() {
  return (
    <section
      aria-labelledby="employee-value-heading"
      className="relative overflow-hidden bg-[#07090c] py-12 sm:py-20 md:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-48 top-1/3 size-[400px] rounded-full bg-emerald-500/[0.06] blur-[130px] hidden sm:block"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">

          {/* Left: text */}
          <div>
            <h2
              id="employee-value-heading"
              className="text-balance font-accent text-[1.9rem] font-bold leading-[1.06] tracking-[0.015em] text-white [font-synthesis:weight] sm:text-[clamp(2.4rem,4.5vw,3.5rem)]"
            >
              Ko iegūst darbinieks?
            </h2>
            <p className="mt-4 max-w-md font-accent text-base font-light leading-relaxed tracking-[0.01em] text-white/55 sm:mt-5 sm:text-xl">
              Shadowy palīdz nevis pierādīt, ka cilvēks strādā, bet{" "}
              <strong className="font-semibold text-white/75 [font-synthesis:weight]">
                parādīt, kas viņam traucē strādāt efektīvāk.
              </strong>
            </p>
          </div>

          {/* Right: 2×2 grid with hover effects */}
          <motion.div
            className="grid grid-cols-1 rounded-2xl border border-white/[0.08] overflow-hidden sm:grid-cols-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.09 } },
            }}
          >
            {cards.map((card, index) => (
              <motion.div
                key={card.title}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
              >
                <FeatureCard {...card} index={index} />
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
