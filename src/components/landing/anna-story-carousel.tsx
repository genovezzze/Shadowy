"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowLeft, ArrowRight, MoveHorizontal } from "lucide-react";
import { EmphasizedText } from "@/components/landing/emphasized-text";
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
    title: "Bet fokuss bieži tiek pārtraukts",
    role: "Neredzamā slodze",
    paragraphs: [
      "Papildus saviem tiešajiem pienākumiem Anna katru dienu saskaras ar neplānotiem pārtraukumiem",
      "Kolēģu jautājumi, steidzami uzdevumi, informācijas gaidīšana un koordinācija ārpus lomas - katrs šķiet mazs, bet kopā tie izjauc dziļo darbu",
    ],
    tags: [
      "Fokusa pārtraukumi",
      "Atkārtoti jautājumi",
    ],
  },
  {
    image: "/images/anna/anna-3.png",
    title: "Darbs notiek, bet netiek fiksēts",
    role: "Neredzamais ieguldījums",
    paragraphs: [
      "Šie pārtraukumi neparādās nekur - ne kalendārā, ne atskaitēs, ne darba uzdevumos",
      "Uzņēmums neredz, cik laika aiziet ārpus pamatdarba. Vadība neredz, kas traucē Annai strādāt efektīvāk",
    ],
    tags: ["Nav datos", "Nav atskaitē", "Nav redzams vadībai"],
  },
  {
    image: "/images/anna/anna-4.png",
    title: "Te palīdz Shadowy",
    role: "Risinājums",
    paragraphs: [
      "Anna vienkārši apraksta, kas šodien traucēja vai aizņēma papildu laiku. Shadowy AI izveido melnraksta ierakstus",
      "Neko automātiski nesaglabā - Anna pārskata un apstiprina. 30 sekundes dienā",
    ],
    tags: [
      "AI melnraksts",
      "Darbinieks apstiprina",
      "30 sek. dienā",
    ],
  },
  {
    image: "/images/anna/anna-5.png",
    title: "Rezultāts",
    role: "Redzamas izmaksas",
    paragraphs: [
      "Vadība tagad redz, kur komandā pazūd laiks, kuri procesi rada slēpto slodzi un ko var uzlabot",
      "Anna var parādīt, kas viņai traucē strādāt efektīvāk - un uzņēmums var to novērst",
    ],
    tags: ["Redzamas izmaksas", "Labāki lēmumi", "Mazāk šķēršļu"],
  },
] as const;

const importantStoryPhrases = [
  "galvenie pienākumi",
  "darbs, kuru vadība redz",
  "fokuss bieži tiek pārtraukts",
  "neplānotiem pārtraukumiem",
  "izjauc dziļo darbu",
  "neparādās nekur",
  "kas traucē Annai strādāt efektīvāk",
  "melnraksta ierakstus",
  "kur komandā pazūd laiks",
  "ko var uzlabot",
] as const;

const mobileCardVariants: Variants = {
  enter: (direction: number) => ({
    x: direction * 120,
    rotate: direction * 3,
    scale: 0.96,
    opacity: 0,
  }),
  center: {
    x: 0,
    rotate: 0,
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 28 },
  },
  exit: (direction: number) => ({
    x: direction * -260,
    rotate: direction * -7,
    scale: 0.9,
    opacity: 0,
    transition: { duration: 0.32, ease: [0.4, 0, 1, 1] },
  }),
};

const desktopCardVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.16 } },
};

export function AnnaStoryCarousel() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const [isMobile, setIsMobile] = React.useState(false);
  const [showIdleSwipePrompt, setShowIdleSwipePrompt] = React.useState(false);
  const idleSwipeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeSlide = slides[activeIndex];

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const updateMobileState = () => setIsMobile(mediaQuery.matches);

    updateMobileState();
    mediaQuery.addEventListener("change", updateMobileState);
    return () => mediaQuery.removeEventListener("change", updateMobileState);
  }, []);

  const resetIdleSwipePrompt = React.useCallback(() => {
    if (idleSwipeTimer.current) {
      clearTimeout(idleSwipeTimer.current);
    }

    setShowIdleSwipePrompt(false);

    if (isMobile && activeIndex === 0) {
      idleSwipeTimer.current = setTimeout(() => {
        setShowIdleSwipePrompt(true);
      }, 4200);
    }
  }, [activeIndex, isMobile]);

  React.useEffect(() => {
    resetIdleSwipePrompt();

    return () => {
      if (idleSwipeTimer.current) {
        clearTimeout(idleSwipeTimer.current);
      }
    };
  }, [activeIndex, resetIdleSwipePrompt]);

  const showSlide = React.useCallback((index: number) => {
    setDirection(index >= activeIndex ? 1 : -1);
    setActiveIndex((index + slides.length) % slides.length);
  }, [activeIndex]);

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
      className="relative z-[46] overflow-hidden bg-[#070809] py-8 sm:-mt-px sm:mx-4 sm:rounded-[32px] sm:border sm:border-white/[0.08] sm:py-24 md:py-32 lg:mx-7"
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
        className="pointer-events-none absolute -left-52 top-1/3 size-[430px] rounded-full bg-emerald-500/[0.09] blur-[120px] hidden sm:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-52 bottom-0 size-[480px] rounded-full bg-emerald-950/[0.18] blur-[130px] hidden sm:block"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
        <header className="mx-auto max-w-none text-center">
          <h2
            id="anna-story-heading"
            className="text-balance font-accent text-[2rem] font-bold leading-[1.08] tracking-[0.015em] text-white [font-synthesis:weight] sm:text-[clamp(2.4rem,4.1vw,3.75rem)]"
          >
            Kur pazūd laiks, nauda un komandas fokuss
          </h2>
          <p className="mx-auto mt-5 max-w-5xl text-balance font-accent text-base font-light leading-7 tracking-[0.01em] text-white/72 sm:text-[clamp(1.05rem,1.5vw,1.4rem)] sm:text-white/80">
            Daļa darba notiek ārpus sistēmām - ārpus kalendāra, uzdevumiem un atskaitēm.
            <br className="hidden xl:block" />
            {" "}Katrs gadījums šķiet mazs, bet kopā tie kļūst par reālām izmaksām
          </p>
        </header>

        <div className="mx-auto mt-5 max-w-3xl md:mt-10">
          <div className="relative overflow-hidden rounded-[20px] border border-white/[0.1] bg-black p-1.5 shadow-[0_24px_90px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.06)] sm:rounded-[24px] sm:p-2">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_12%_18%,rgba(52,211,153,0.07),transparent_72%),radial-gradient(70%_60%_at_90%_90%,rgba(6,78,59,0.11),transparent_70%)]"
            />

            <motion.div
              className="relative will-change-transform"
              animate={
                isMobile && activeIndex === 0 && showIdleSwipePrompt
                  ? {
                      x: [0, -17, 7, 0],
                      rotate: [0, -0.7, 0.3, 0],
                      scale: [1, 0.988, 0.996, 1],
                    }
                  : { x: 0, rotate: 0, scale: 1 }
              }
              transition={
                isMobile && activeIndex === 0 && showIdleSwipePrompt
                  ? {
                      duration: 1.15,
                      ease: [0.22, 1, 0.36, 1],
                      repeat: Infinity,
                      repeatDelay: 2.3,
                    }
                  : { duration: 0.2 }
              }
            >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={isMobile ? mobileCardVariants : desktopCardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="relative grid cursor-grab overflow-hidden rounded-[16px] border border-white/[0.06] bg-black active:cursor-grabbing sm:cursor-auto sm:rounded-[18px] lg:h-[370px] lg:grid-cols-[44%_56%]"
                drag={isMobile ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                dragMomentum={false}
                dragDirectionLock
                onPointerDown={resetIdleSwipePrompt}
                onDragEnd={(_, info) => {
                  resetIdleSwipePrompt();

                  if (info.offset.x < -50 || info.velocity.x < -500) {
                    showNext();
                  } else if (info.offset.x > 50 || info.velocity.x > 500) {
                    showPrevious();
                  }
                }}
                style={{ touchAction: "pan-y" }}
              >
              <div className="relative h-[220px] overflow-hidden sm:h-[260px] lg:h-auto">
                <AnimatePresence initial={false} mode="sync">
                  <motion.div
                    key={activeSlide.image}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                  >
                    <Image
                      src={activeSlide.image}
                      alt={`${activeSlide.title} - Anna`}
                      fill
                      sizes="(min-width: 1024px) 520px, 100vw"
                      className="object-cover object-[center_18%] sm:object-[center_20%] lg:object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/5 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/55" />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="relative h-[320px] sm:h-[370px] lg:h-full">
                <AnimatePresence initial={false} mode="sync">
                  <motion.div
                    key={activeIndex}
                    className="relative flex h-full flex-col p-3 sm:p-5"
                    aria-live="polite"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <div
                      className="flex w-full max-w-[190px] items-center gap-2.5"
                      aria-label={`${activeIndex + 1}. no ${slides.length} stāsta soļiem`}
                    >
                      <span className="font-accent text-[11px] font-semibold tabular-nums tracking-[0.16em] text-emerald-300">
                        {String(activeIndex + 1).padStart(2, "0")}
                      </span>
                      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.08] ring-1 ring-inset ring-white/[0.04]">
                        <motion.div
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-700 via-emerald-300 to-teal-200 shadow-[0_0_12px_rgba(110,231,183,0.6)]"
                          initial={false}
                          animate={{
                            width: `${((activeIndex + 1) / slides.length) * 100}%`,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 180,
                            damping: 24,
                          }}
                        >
                          <motion.span
                            aria-hidden
                            className="absolute inset-y-0 right-0 w-5 bg-gradient-to-r from-transparent to-white/65"
                            animate={{ opacity: [0.25, 1, 0.25] }}
                            transition={{
                              duration: 1.6,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        </motion.div>
                      </div>
                      <span className="font-accent text-[10px] font-medium tabular-nums tracking-[0.14em] text-white/30">
                        {String(slides.length).padStart(2, "0")}
                      </span>
                    </div>

                    <h3 className="mt-2 text-balance font-accent text-lg font-bold leading-tight tracking-[0.015em] text-white [font-synthesis:weight] sm:mt-3 sm:text-[1.35rem]">
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
                      ) : activeIndex === 4 ? (
                        <>
                          <span className="text-emerald-300">Redzamas</span>
                          {" izmaksas, lab\u0101ki l\u0113mumi"}
                        </>
                      ) : (
                        activeSlide.title
                      )}
                    </h3>

                    <div className="mt-2 space-y-1.5 font-accent text-sm font-light leading-6 tracking-[0.01em] text-white/78 sm:mt-3 sm:space-y-2.5 sm:text-base sm:leading-relaxed">
                      {activeSlide.paragraphs.map((paragraph) => (
                        <p key={paragraph}>
                          <EmphasizedText
                            text={paragraph}
                            phrases={importantStoryPhrases}
                          />
                        </p>
                      ))}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3">
                      {activeSlide.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/[0.09] bg-white/[0.045] px-2 py-1 text-[11px] font-medium text-white/65 sm:px-2.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center gap-2 pt-3 sm:pt-4">
                      <div className="flex w-full items-center gap-2.5 border-t border-white/[0.09] pt-3 text-sm font-bold tracking-[0.025em] text-white/80 sm:hidden">
                        <motion.span
                          aria-hidden
                          animate={{ x: [-4, 4, -4] }}
                          transition={{
                            duration: 1.4,
                            ease: "easeInOut",
                            repeat: Infinity,
                          }}
                        >
                          <MoveHorizontal className="size-5 text-emerald-300" />
                        </motion.span>
                        <span>Velc kartīti, lai turpinātu</span>
                      </div>
                      <button
                        type="button"
                        onClick={showPrevious}
                        aria-label="Iepriekšējais stāsta slaids"
                        className="group hidden size-9 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.055] text-white transition-all hover:border-emerald-300/30 hover:bg-emerald-300/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/50 sm:inline-flex sm:size-10"
                      >
                        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5 sm:size-5" />
                      </button>
                      <button
                        type="button"
                        onClick={showNext}
                        aria-label="Nākamais stāsta slaids"
                        className="group hidden size-9 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.055] text-white transition-all hover:border-emerald-300/30 hover:bg-emerald-300/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/50 sm:inline-flex sm:size-10"
                      >
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 sm:size-5" />
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              </motion.div>
            </AnimatePresence>
            </motion.div>
          </div>

          <div
            className="mt-5 flex items-center justify-center gap-1.5"
            aria-label="Stāsta slaidu navigācija"
          >
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => showSlide(index)}
                aria-label={`Atvērt ${index + 1}. slaidu`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={cn(
                  "h-1 rounded-full transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070809]",
                  index === activeIndex
                    ? "w-12 bg-gradient-to-r from-emerald-500 to-emerald-200 shadow-[0_0_14px_rgba(110,231,183,0.5)]"
                    : index < activeIndex
                      ? "w-6 bg-emerald-800/70 hover:bg-emerald-700"
                      : "w-6 bg-white/15 hover:bg-white/35",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
