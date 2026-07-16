"use client";

import { motion } from "framer-motion";
import { AnimatedDotSurface } from "@/components/ui/animated-dot-surface";
import { AIDraftAnimation } from "@/components/landing/ai-draft-animation";

export function SolutionSection() {
  return (
    <section
      id="risinajums"
      aria-labelledby="solution-heading"
      className="relative overflow-hidden bg-[#07090c] py-14 scroll-mt-24 sm:mx-4 sm:mt-20 sm:rounded-[32px] sm:border sm:border-white/[0.11] sm:py-24 md:py-32 lg:mx-7 lg:mt-24"
    >
      <div
        aria-hidden
        className="animate-solution-grid pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 18%, black 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 18%, black 88%, transparent)",
        }}
      />
      <div
        aria-hidden
        className="animate-solution-glow-a pointer-events-none absolute -left-52 top-1/4 size-[440px] rounded-full bg-emerald-500/[0.11] blur-[130px] hidden sm:block"
      />
      <div
        aria-hidden
        className="animate-solution-glow-b pointer-events-none absolute -right-48 bottom-0 size-[460px] rounded-full bg-blue-500/[0.11] blur-[140px] hidden sm:block"
      />
      <div
        aria-hidden
        className="animate-solution-glow-c pointer-events-none absolute left-[42%] top-[18%] size-[280px] rounded-full bg-cyan-400/[0.055] blur-[110px] hidden sm:block"
      />
      <AnimatedDotSurface className="top-8 z-0 h-[500px] opacity-90" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <header className="mx-auto max-w-none text-center">
          <h2
            id="solution-heading"
            className="text-balance font-accent text-[2rem] font-bold leading-[1.06] tracking-[0.015em] text-white [font-synthesis:weight] sm:text-[clamp(2.4rem,4.1vw,3.25rem)] xl:whitespace-nowrap"
          >
            Bez garām formām.{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Apraksti, kas traucēja pamatdarbam
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-4xl font-accent text-base font-light leading-7 tracking-[0.01em] text-white/75 sm:text-xl sm:leading-relaxed sm:text-white/85">
            Darbinieks apraksta situāciju saviem vārdiem vai ierunā to
            <br className="hidden sm:block" />
            {" "}<strong className="font-bold text-white/85 [font-synthesis:weight]">
              Shadowy AI pārvērš to strukturētos datos
            </strong>
            {" "}- darbinieks tikai pārskata un apstiprina
          </p>
        </header>

        <motion.div
          className="relative mt-10 md:mt-16"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <AIDraftAnimation />
        </motion.div>
      </div>
    </section>
  );
}
