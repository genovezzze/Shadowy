"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const slides = [
  {
    image: "/images/anna/anna-1.png",
    title: "Iepazīsties ar Annu",
    role: "Grāmatvede",
    paragraphs: [
      "Anna strādā grāmatvedībā. Viņas galvenie pienākumi ir nodokļi, atskaites un ikdienas finanšu dokumenti",
      "Tas ir darbs, kuru vadība redz un var novērtēt pēc rezultātiem",
    ],
    tags: ["Nodokļi", "Atskaites", "Grāmatvedība"],
  },
  {
    image: "/images/anna/anna-2.png",
    title: "Bet tas nav viss",
    role: "Papildu darbs",
    paragraphs: [
      "Papildus saviem tiešajiem pienākumiem Anna regulāri palīdz arī citur",
      "Viņa izskaidro procesus, palīdz ar dokumentiem, ievada jaunos darbiniekus un atbild uz jautājumiem, kas neietilpst viņas oficiālajā lomā",
    ],
    tags: [
      "Admin atbalsts",
      "Palīdzība kolēģiem",
      "Jauno darbinieku ievadīšana",
      "Tulkošana",
    ],
  },
  {
    image: "/images/anna/anna-3.png",
    title: "Darbs notiek, bet netiek fiksēts",
    role: "Neredzamais ieguldījums",
    paragraphs: [
      "Kolēģi novērtē Annas palīdzību, bet šis ieguldījums neparādās nevienā atskaitē",
      "Vadība redz paveiktos grāmatvedības uzdevumus, bet neredz laiku un enerģiju, ko Anna iegulda komandas atbalstā",
    ],
    tags: ["Nav datos", "Nav atskaitē", "Nav redzams vadībai"],
  },
  {
    image: "/images/anna/anna-4.png",
    title: "Te palīdz Shadowy",
    role: "Risinājums",
    paragraphs: [
      "Shadowy palīdz darbiniekiem fiksēt neredzamo darbu vienkāršā un saprotamā veidā",
      "Palīdzība kolēģiem, papildu komunikācija, ievadīšana darbā un citi ieguldījumi kļūst redzami datos",
    ],
    tags: [
      "Redzams ieguldījums",
      "Godīgāka atzinība",
      "Labāki dati vadībai",
    ],
  },
  {
    image: "/images/anna/anna-5.png",
    title: "Rezultāts",
    role: "Darbs tiek pamanīts",
    paragraphs: [
      "Anna joprojām palīdz komandai, bet tagad viņas papildu ieguldījums vairs nepazūd",
      "Vadība redz ne tikai gala rezultātu, bet arī to, kas palīdz komandai kustēties uz priekšu",
    ],
    tags: ["Pamanīts", "Novērtēts", "Pierādāms"],
  },
] as const;

export function AnnaStoryCarousel() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const activeSlide = slides[activeIndex];

  const showSlide = React.useCallback(
    (index: number, nextDirection: number) => {
      setDirection(nextDirection);
      setActiveIndex((index + slides.length) % slides.length);
    },
    [],
  );

  const showNext = React.useCallback(() => {
    setDirection(1);
    setActiveIndex((current) => (current + 1) % slides.length);
  }, []);

  const showPrevious = React.useCallback(() => {
    setDirection(-1);
    setActiveIndex(
      (current) => (current - 1 + slides.length) % slides.length,
    );
  }, []);

  return (
    <section
      id="problema"
      aria-labelledby="anna-story-heading"
      className="relative -mt-px mx-2 overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#07090c] py-24 sm:mx-4 sm:rounded-[32px] md:py-32 lg:mx-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.07) 0.7px, transparent 0.8px)",
          backgroundSize: "30px 30px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 16%, black 84%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 16%, black 84%, transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-52 top-1/3 size-[430px] rounded-full bg-emerald-500/[0.09] blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-52 bottom-0 size-[480px] rounded-full bg-blue-500/[0.09] blur-[130px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
        <header className="mx-auto max-w-none text-center">
          <h2
            id="anna-story-heading"
            className="font-accent text-[clamp(1.8rem,4.1vw,3.75rem)] font-bold tracking-[0.02em] text-white [font-synthesis:weight] lg:whitespace-nowrap"
          >
            Darbs, kas notiek, bet netiek pamanīts
          </h2>
          <p className="mx-auto mt-5 max-w-none font-accent text-[clamp(1.05rem,1.5vw,1.4rem)] font-light leading-relaxed tracking-[0.012em] text-white/80 lg:whitespace-nowrap">
            Daļa komandas ieguldījuma nav redzama datos - īpaši tad, kad cilvēki
            palīdz citiem ārpus savas tiešās lomas
          </p>
        </header>

        <div className="mx-auto mt-4 max-w-3xl md:mt-5">
          <div className="relative overflow-hidden rounded-[24px] border border-white/[0.1] bg-white/[0.035] p-2 shadow-[0_24px_90px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_12%_18%,rgba(52,211,153,0.07),transparent_72%),radial-gradient(70%_60%_at_90%_90%,rgba(59,130,246,0.07),transparent_70%)]"
            />

            <div className="relative grid h-[610px] overflow-hidden rounded-[18px] border border-white/[0.06] bg-[#090d11]/95 sm:h-[580px] lg:h-[370px] lg:grid-cols-[44%_56%]">
              <div className="relative h-[220px] overflow-hidden lg:h-auto">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.div
                    key={activeSlide.image}
                    initial={{ opacity: 0, x: direction * 28, scale: 1.025 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: direction * -28, scale: 0.99 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={activeSlide.image}
                      alt={`${activeSlide.title} — Anna`}
                      fill
                      sizes="(min-width: 1024px) 520px, 100vw"
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090d11]/65 via-transparent to-black/5 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#090d11]/45" />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="relative flex h-[390px] flex-col overflow-hidden p-4 sm:h-[360px] sm:p-5 lg:h-auto lg:p-5">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.34, ease: "easeOut" }}
                    className="flex h-full flex-col"
                    aria-live="polite"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs tracking-[0.18em] text-white/35">
                        {String(activeIndex + 1).padStart(2, "0")} /{" "}
                        {String(slides.length).padStart(2, "0")}
                      </span>
                    </div>

                    <h3 className="mt-3 font-accent text-[1.35rem] font-bold tracking-[0.02em] text-white [font-synthesis:weight]">
                      {activeIndex === 0 ? (
                        <>
                          {"Iepaz\u012bsties ar "}
                          <span className="text-emerald-300">Annu</span>
                        </>
                      ) : activeIndex === 2 ? (
                        <>
                          {"Darbs "}
                          <span className="text-emerald-300">notiek</span>
                          {", bet "}
                          <span className="text-emerald-300">
                            {"netiek fiks\u0113ts"}
                          </span>
                        </>
                      ) : activeIndex === 3 ? (
                        <>
                          {"Te pal\u012bdz "}
                          <span className="text-emerald-300">Shadowy</span>
                        </>
                      ) : (
                        activeSlide.title
                      )}
                    </h3>

                    <div className="mt-3 space-y-2.5 font-accent text-[15px] font-light leading-relaxed tracking-[0.012em] text-white/80 sm:text-base">
                      {activeSlide.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {activeSlide.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/[0.09] bg-white/[0.045] px-2.5 py-1 text-[11px] font-medium text-white/65"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center gap-2 pt-4">
                      <button
                        type="button"
                        onClick={showPrevious}
                        aria-label="Iepriekšējais stāsta slaids"
                        className="group inline-flex size-8 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.055] text-white transition-all hover:border-emerald-300/30 hover:bg-emerald-300/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/50"
                      >
                        <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-0.5" />
                      </button>
                      <button
                        type="button"
                        onClick={showNext}
                        aria-label="Nākamais stāsta slaids"
                        className="group inline-flex size-8 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.055] text-white transition-all hover:border-emerald-300/30 hover:bg-emerald-300/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/50"
                      >
                        <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div
            className="mt-5 flex items-center justify-center gap-2.5"
            aria-label="Stāsta slaidu navigācija"
          >
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                onClick={() =>
                  showSlide(index, index >= activeIndex ? 1 : -1)
                }
                aria-label={`Atvērt ${index + 1}. slaidu`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={cn(
                  "h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07090c]",
                  index === activeIndex
                    ? "w-8 bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.5)]"
                    : "w-2 bg-white/20 hover:bg-white/40",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
