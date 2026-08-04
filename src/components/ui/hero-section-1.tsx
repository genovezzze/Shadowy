"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  ArrowUpRight,
  Building2,
  ChevronDown,
  CircleAlert,
  ListChecks,
  Menu,
  ShieldCheck,
  UserRound,
  Workflow,
  X,
} from "lucide-react";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Button } from "@/components/ui/button";
import { ButtonColorful } from "@/components/ui/button-colorful";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { HeroRotatingTags } from "@/components/landing/hero-rotating-tags";
import { HeroVideoBackground } from "@/components/landing/hero-video-background";
import { LiveDashboardPreview } from "@/components/landing/live-dashboard-preview";
import { MobileDashboardPreview } from "@/components/landing/mobile-dashboard-preview";

// Below-the-fold sections are code-split into their own chunks so the hero
// hydrates without parsing all section JS up front. ssr stays enabled (default)
// so the server-rendered HTML - and therefore the visual output - is unchanged.
const ClientCasesSection = dynamic(() =>
  import("@/components/landing/client-cases-section").then((m) => m.ClientCasesSection),
);
const PilotResultsSection = dynamic(() =>
  import("@/components/landing/pilot-results-section").then((m) => m.PilotResultsSection),
);
const ClosingSections = dynamic(() =>
  import("@/components/landing/closing-sections").then((m) => m.ClosingSections),
);
import { cn } from "@/lib/utils";

const transitionVariants: { item: Variants } = {
  item: {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", bounce: 0.3, duration: 1.5 },
    },
  },
};

const menuItems = [
  { number: "01", name: "Kā tas darbojas", caption: "Produkts un darba plūsma", href: "/ka-tas-darbojas" },
  { number: "02", name: "Pilots", caption: "Izmēģiniet Shadowy komandā", href: "#pilots" },
  { number: "03", name: "FAQ", caption: "Atbildes uz jautājumiem", href: "#faq" },
  { number: "04", name: "Privātums", caption: "Dati un drošība", href: "/privacy" },
];

const howItWorksMenuItems = [
  {
    icon: CircleAlert,
    motion: "problem",
    title: "Problēma",
    text: "Kur ikdienā pazūd komandas laiks un fokuss.",
    href: "/ka-tas-darbojas#problema",
  },
  {
    icon: Workflow,
    motion: "workflow",
    title: "Kā Shadowy strādā",
    text: "No īsa ieraksta līdz strukturētai analītikai.",
    href: "/ka-tas-darbojas#risinajums",
  },
  {
    icon: UserRound,
    motion: "user",
    title: "Darbiniekiem",
    text: "Vienkārša darba fiksēšana bez papildu kontroles.",
    href: "/ka-tas-darbojas#darbiniekiem",
  },
  {
    icon: Building2,
    motion: "building",
    title: "Uzņēmumam",
    text: "Slodze, izmaksas un atkārtojošies procesi vienuviet.",
    href: "/ka-tas-darbojas#uznemumam",
  },
  {
    icon: ListChecks,
    motion: "checklist",
    title: "Ko fiksēt",
    text: "Praktiski piemēri darbam, kas paliek ārpus atskaitēm.",
    href: "/ka-tas-darbojas#ko-fikset",
  },
  {
    icon: ShieldCheck,
    motion: "shield",
    title: "Privātums",
    text: "Kā Shadowy aizsargā darbinieku un uzņēmuma datus.",
    href: "/ka-tas-darbojas#privatums",
  },
] as const;

export function HeroSection() {
  const [previewMode, setPreviewMode] = React.useState<
    "mobile" | "desktop" | null
  >(null);

  // The hero pins while the dashboard slides up over it. Only on pointer-sized
  // screens, and never when the visitor asked for reduced motion - a scroll
  // that stops moving the page is exactly the kind of effect that pref covers.
  // Everywhere else the dashboard just follows the hero in normal flow.
  const [isPinned, setIsPinned] = React.useState(false);
  const pinRunwayRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      setPreviewMode(mediaQuery.matches ? "mobile" : "desktop");
      setIsPinned(!mediaQuery.matches && !reducedMotion.matches);
    };

    update();
    mediaQuery.addEventListener("change", update);
    reducedMotion.addEventListener("change", update);
    return () => {
      mediaQuery.removeEventListener("change", update);
      reducedMotion.removeEventListener("change", update);
    };
  }, []);

  // Logo spin: hovering starts it, leaving does not cut it off mid-turn. The
  // hover flag is checked on each animationiteration, so the spin is dropped
  // only at the exact moment a full 360 completes - it always lands upright.
  const [isLogoSpinning, setIsLogoSpinning] = React.useState(false);
  const isLogoHoveredRef = React.useRef(false);

  const startLogoSpin = React.useCallback(() => {
    isLogoHoveredRef.current = true;
    setIsLogoSpinning(true);
  }, []);

  const releaseLogoSpin = React.useCallback(() => {
    isLogoHoveredRef.current = false;

    // With reduced motion the spin never runs, so no animationiteration will
    // ever arrive to settle it - drop out of the hovered look right away.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsLogoSpinning(false);
    }
  }, []);

  const settleLogoSpin = React.useCallback(
    (event: React.AnimationEvent<HTMLElement>) => {
      // Animation events bubble: the mark's own shimmer would otherwise settle
      // the spin early. Only the wrapper's own rotation counts.
      if (event.target !== event.currentTarget) return;
      if (!isLogoHoveredRef.current) setIsLogoSpinning(false);
    },
    [],
  );

  // Leaving is given a longer, softer curve than arriving - a symmetric ease
  // reads abrupt on the way out. Shared by the mark and the wordmark so the
  // two still finish together.
  const lockupEasing = isLogoSpinning
    ? "duration-500 ease-out"
    : "duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

  // Both layers are the logo shape punched out of a solid fill, cross-faded on
  // hover. A cross-fade is what makes the colour change reversible - you cannot
  // transition a flat colour into an animated gradient.
  // Overrides only the duration of the shared shimmer class, so the lockup can
  // run fast without speeding up the section heading that uses the same class.
  const shimmerSpeed: React.CSSProperties = { animationDuration: "1.3s" };

  const logoMaskStyle = React.useMemo<React.CSSProperties>(
    () => ({
      maskImage: "url('/shadowy.svg')",
      WebkitMaskImage: "url('/shadowy.svg')",
      maskSize: "contain",
      WebkitMaskSize: "contain",
      maskRepeat: "no-repeat",
      WebkitMaskRepeat: "no-repeat",
      maskPosition: "center",
      WebkitMaskPosition: "center",
    }),
    [],
  );

  const { scrollYProgress } = useScroll({
    target: pinRunwayRef,
    offset: ["start start", "end end"],
  });

  // Fully arrived at 85% of the runway, so the dashboard sits still for a beat
  // before the pin releases and the page carries on to the Anna section.
  const dashboardY = useTransform(scrollYProgress, [0, 0.85], ["100%", "0%"]);

  // Phones: the hero sticks while the phone mockup rides up over it, so the
  // lockup has to get out of the way - otherwise it stays lit underneath and
  // pokes out below the device. Faded on page scroll, not on the pin progress,
  // because the mobile hero is held by plain CSS stickiness.
  const { scrollY } = useScroll();
  // Measured in fractions of the hero's own height (100svh on phones), not in
  // fixed pixels. The device rises through a viewport-relative distance, so a
  // hard-coded window only lined up on the one screen it was tuned on: on a
  // 740px-tall phone the wordmark was still at ~90% when the device's top edge
  // sliced through it, and on a 932px one it had dimmed away in the open well
  // before the device arrived. The phone's edge reaches the lockup at ~0.57 of
  // the hero height on every size; the rotating tag line hangs below the
  // wordmark and is what the edge meets first, at ~0.53. The fade ends there
  // and takes 0.13 of a screen - the same beat regardless of device.
  const heroHeightRef = React.useRef(0);

  React.useEffect(() => {
    const measure = () => {
      heroHeightRef.current = pinRunwayRef.current?.offsetHeight ?? 0;
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const lockupOpacity = useTransform(scrollY, (value) => {
    const height = heroHeightRef.current;
    if (!height) return 1;

    const start = height * 0.4;
    const end = height * 0.53;
    return 1 - Math.min(1, Math.max(0, (value - start) / (end - start)));
  });

  // The transparent nav reads badly once the dashboard is behind it - its own
  // sidebar and logo show through the links - so the nav goes solid as the
  // panel approaches. Driven by the scroll position rather than by
  // scrollYProgress: that value clamps at 1 the moment the pin releases, which
  // is exactly when the dashboard starts sliding up under the nav, so it went
  // quiet right when the overlap began. Reading the panel's own top edge also
  // keeps this correct at any window size. rAF-throttled: at most one layout
  // read per frame.
  const dashboardPanelRef = React.useRef<HTMLDivElement | null>(null);
  const [dashboardMeetsNav, setDashboardMeetsNav] = React.useState(false);

  React.useEffect(() => {
    if (!isPinned) {
      setDashboardMeetsNav(false);
      return;
    }

    let frame = 0;

    const measure = () => {
      frame = 0;
      const panel = dashboardPanelRef.current;
      if (!panel) return;

      const { top, bottom } = panel.getBoundingClientRect();
      // Nav occupies roughly the top 88px - switch a little before contact so
      // the change has landed by the time the two actually meet.
      setDashboardMeetsNav(top < 150 && bottom > 0);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [isPinned]);

  // Both wrappers use overflow-x-clip rather than overflow-hidden: `hidden`
  // turns an ancestor into a scroll container, which silently kills the
  // position:sticky pin below it.
  return (
    <div className="relative isolate min-h-[100svh] overflow-x-clip bg-[#070809] text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[980px]"
        style={{
          background:
            "radial-gradient(45% 24% at 50% 0%, rgba(255, 255, 255, 0.018) 0%, transparent 72%), linear-gradient(180deg, #060708 0%, #070809 58%, #080a0d 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-16 -z-10 h-[760px] opacity-35"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.34) 0.7px, transparent 0.9px)",
          backgroundPosition: "0 0",
          backgroundSize: "31px 31px",
          maskImage:
            "radial-gradient(ellipse 24% 22% at 74% 57%, black 0%, rgba(0,0,0,.62) 48%, transparent 84%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 24% 22% at 74% 57%, black 0%, rgba(0,0,0,.62) 48%, transparent 84%)",
        }}
      />
      <HeroHeader
        pinned={isPinned}
        heroRef={pinRunwayRef}
        meetsDashboard={dashboardMeetsNav}
      />
      <main className="overflow-x-clip">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2] isolate hidden opacity-30 lg:block"
        >
          <div className="absolute left-[-14rem] top-[-31rem] h-[80rem] w-[35rem] -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(255,255,255,.055)_0,rgba(255,255,255,.012)_50%,transparent_80%)]" />
        </div>

        {/* Runway height comes from CSS, not from isPinned: useScroll measures
            the target on mount, and a JS-applied height lands after that
            measurement. The section was then still one viewport tall, which
            collapses the scroll range to zero and pins progress at 1 - the
            dashboard sat fully arrived before any scrolling, and only sorted
            itself out once a scroll forced a re-measure. The media conditions
            here mirror isPinned exactly. */}
        {/* Sticky scope for the phone hero. Without this wrapper the hero
            section's sticky container is <main>, so on phones it stayed parked
            at the top of the viewport for the whole page - its video kept
            decoding and showed through every section below that was not
            painted opaque. Ending the scope right after the mockup section
            keeps the intended effect (the phone rides up over the lockup) and
            lets the hero scroll away for good once it has played out. */}
        <div className="relative">
          {/* Phones: the section itself sticks, so the hero holds its place and
              the phone mockup below scrolls up over it and covers the lockup.
              Desktop keeps the taller runway with the sticky child inside. */}
          <section
            ref={pinRunwayRef}
            className="sticky top-0 z-0 h-[100svh] sm:static sm:z-20 sm:h-auto motion-safe:sm:h-[200vh]"
          >
            {/* svh only, and never alongside h-screen. Tailwind emits
                .h-screen after .h-[100svh], so the pair silently resolved to
                100vh - the large viewport, the one you get once the browser
                chrome is gone. With the bars still up that made the hero taller
                than the screen, and the first swipe went into collapsing them
                and letting the lockup settle into its real place instead of
                into scrolling. Sized to the small viewport it fits from the
                first paint: the bars still retract, but nothing resizes when
                they do. pt is svh too, so the lockup keeps its position
                relative to the box it sits in. */}
            <div className="sticky top-0 flex h-[100svh] items-start justify-center overflow-hidden px-5 pb-16 pt-[33svh] sm:items-center sm:px-6 sm:py-24">
              <HeroVideoBackground />

              {/* Hover target is this wrapper, sized to its content rather than
                  to the 896px column - as a full-width row the spin fired from
                  far outside the lockup. w-fit pulls the trigger area in to the
                  block the visitor actually sees.
                  The fade is keyed off previewMode rather than !isPinned: phones
                  are the one layout where the hero is held in place and the
                  device rides over the lockup, so a desktop visitor with reduced
                  motion - who also gets no pin - keeps a lockup that simply
                  scrolls away with the page. */}
              <motion.div
                style={{ opacity: previewMode === "mobile" ? lockupOpacity : 1 }}
                className="relative z-10 mx-auto w-fit cursor-default"
                onMouseEnter={startLogoSpin}
                onMouseLeave={releaseLogoSpin}
              >
              <AnimatedGroup
                variants={transitionVariants}
                className="mx-auto flex w-full max-w-4xl flex-col items-stretch text-center font-accent font-light"
              >
                <div
                  className="flex w-full items-center justify-center gap-3 sm:gap-5 lg:gap-6"
                >
                  <span
                    aria-hidden
                    onAnimationIteration={settleLogoSpin}
                    className={cn(
                      "relative block size-9 shrink-0 sm:size-[3.75rem] lg:size-[4.25rem]",
                      isLogoSpinning &&
                        "motion-safe:animate-[spin_2.6s_linear_infinite]",
                    )}
                  >
                    <span
                      style={logoMaskStyle}
                      className={cn(
                        "absolute inset-0 bg-white transition-opacity",
                        lockupEasing,
                        isLogoSpinning ? "opacity-0" : "opacity-100",
                      )}
                    />
                    <span
                      style={{ ...logoMaskStyle, ...shimmerSpeed }}
                      className={cn(
                        "animate-solution-heading-green absolute inset-0 transition-opacity",
                        lockupEasing,
                        isLogoSpinning ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </span>
                  {/* Driven by the spin state rather than :hover, so the text
                      holds its hovered look until the mark finishes its turn and
                      then eases back over the same 500ms - the two land together
                      instead of the text snapping back on mouseleave. The white
                      and shimmering copies cross-fade for the same reason as the
                      mark: a flat colour cannot transition into a moving
                      gradient. */}
                  <span
                    className={cn(
                      "relative inline-block font-display text-[clamp(1.9rem,8.4vw,2.4rem)] font-medium leading-none tracking-[-0.022em] transition-transform motion-reduce:transform-none sm:text-[4rem] lg:text-[4.6rem]",
                      lockupEasing,
                      isLogoSpinning ? "scale-[1.06]" : "scale-100",
                    )}
                  >
                    <span
                      className={cn(
                        "text-white transition-opacity",
                        lockupEasing,
                        isLogoSpinning ? "opacity-0" : "opacity-100",
                      )}
                    >
                      Shadowy
                    </span>
                    <span
                      aria-hidden
                      style={shimmerSpeed}
                      className={cn(
                        "animate-solution-heading-green absolute inset-0 bg-clip-text text-transparent transition-opacity",
                        lockupEasing,
                        isLogoSpinning ? "opacity-100" : "opacity-0",
                      )}
                    >
                      Shadowy
                    </span>
                  </span>
                </div>

                {/* Phones only - it fills the slot the hidden h1 leaves under
                    the lockup. Mounted on the flag rather than hidden with
                    sm:hidden so no timer runs for a line desktop never shows. */}
                {previewMode === "mobile" && <HeroRotatingTags />}

                {/* Kept in the DOM on every viewport so the server-rendered HTML
                    always carries exactly one h1 with the page's key sentence.
                    On phones it is hidden here and repeated as plain text under
                    the device mockup - CSS cannot move a node between sections. */}
                <h1 className="mx-auto mt-3 hidden max-w-3xl text-balance text-center text-[clamp(1.05rem,4.6vw,1.3rem)] font-light leading-[1.55] tracking-[0.01em] text-white/[0.63] sm:mt-4 sm:block sm:text-2xl lg:mt-5 lg:text-[1.75rem] lg:leading-[1.5]">
                  <span className="block">Redziet neredzamo darbu, fokusa zudumu un to,</span>
                  <span className="block">kuri klienti jūsu uzņēmumam izmaksā visdārgāk</span>
                </h1>
              </AnimatedGroup>
              </motion.div>

              {isPinned && (
                <motion.div
                  style={{ y: dashboardY }}
                  className="absolute inset-0 z-30 flex items-center justify-center px-4 pb-10 pt-28 lg:px-7"
                >
                  {/* Width is also capped by the height left under the nav, so a
                      16:9 panel can never grow tall enough to reach the header -
                      on a short window it narrows instead of colliding. */}
                  <div
                    ref={dashboardPanelRef}
                    className="mx-auto w-full max-w-[min(56rem,calc((100svh-12rem)*16/9))] overflow-hidden rounded-[24px] border bg-background p-1.5 shadow-[0_-24px_90px_rgba(0,0,0,0.55)] ring-1 ring-background sm:p-3 dark:shadow-[0_-24px_90px_rgba(0,0,0,0.55),inset_0_1px_rgba(255,255,255,0.2)]"
                  >
                    <LiveDashboardPreview />
                  </div>
                </motion.div>
              )}
            </div>
          </section>

          {/* Hidden until the layout mode is known. The server cannot tell which
              viewport it is rendering for, so without this the bordered preview
              panel paints below the hero on first load and only disappears once
              hydration decides the hero is pinned - a visible flash of a
              dashboard that should not be there yet. Also hidden while pinned:
              the dashboard then lives inside the hero, and this block would only
              leave ~200px of dead gap before the Anna section. */}
          <section
            className={cn(
              "relative z-20",
              (previewMode === null || isPinned) && "hidden",
            )}
          >
            <div className="relative pt-4 sm:pt-10 md:pt-14">
              <AnimatedGroup
                variants={{
                  container: {
                    visible: { transition: { delayChildren: 1 } },
                  },
                  item: {
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        type: "spring",
                        bounce: 0.3,
                        duration: 2,
                      },
                    },
                  },
                }}
                className="absolute inset-0 -z-20"
              >
                <div className="absolute inset-x-0 top-20 h-[760px]" />
              </AnimatedGroup>

              {/* Desktop only: this reaches solid #070809 at its edges, which on
                  phones now travels over the sticky hero and reads as a dark
                  slab behind the phone instead of an invisible page backdrop. */}
              <div
                aria-hidden
                className="absolute inset-0 -z-10 hidden h-full w-full [background:radial-gradient(115%_95%_at_50%_100%,transparent_0%,rgba(7,8,9,.16)_50%,#070809_90%)] sm:block"
              />

              <AnimatedGroup
                variants={{
                  container: {
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.75,
                      },
                    },
                  },
                  ...transitionVariants,
                }}
                className="relative z-[45]"
              >
                <div className="relative mt-0 overflow-visible px-4 pb-8 sm:mt-12 sm:overflow-hidden sm:px-4 sm:pb-16 md:mt-20 lg:px-7">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-10 hidden bg-[linear-gradient(to_bottom,transparent_0%,transparent_68%,rgba(7,8,9,0.45)_84%,#070809_100%)] sm:block"
                  />
                  {!isPinned && (
                    <div className="hidden sm:block relative mx-auto w-full max-w-4xl overflow-hidden rounded-xl border bg-background p-1.5 shadow-lg shadow-zinc-950/15 ring-1 ring-background sm:rounded-[24px] sm:p-3 dark:shadow-[inset_0_1px_rgba(255,255,255,0.2)]">
                      {previewMode === "desktop" ? (
                        <LiveDashboardPreview />
                      ) : (
                        <div className="aspect-video w-full" />
                      )}
                    </div>
                  )}
                  <div className="mt-6 sm:hidden sm:mt-0">
                    {previewMode === "mobile" ? (
                      <MobileDashboardPreview />
                    ) : (
                      <div className="mx-auto -mb-[140px] aspect-[390/744] w-full max-w-[320px]" />
                    )}
                  </div>
                </div>
              </AnimatedGroup>
            </div>
          </section>
        </div>

        <div className="relative bg-[#070809]">
          <ScrollReveal effect="rise" className="relative z-30">
            <ClientCasesSection />
          </ScrollReveal>
          <ScrollReveal effect="fade" className="relative z-30">
            <section className="bg-[#070809] px-5 pb-8 sm:px-6 sm:pb-10">
              <Link
                href="/ka-tas-darbojas"
                className="group mx-auto flex max-w-5xl flex-col gap-6 border-y border-white/[0.12] py-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-[#75babc]">
                    Produkts
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
                    Kā darbojas Shadowy?
                  </h2>
                  <p className="mt-2 max-w-2xl font-sans text-sm leading-6 text-white/58 sm:text-base">
                    Apskatiet visu ceļu no ikdienas darba fiksēšanas līdz komandas slodzes, izmaksu un procesu analīzei.
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-2 font-display text-sm font-bold text-white/72 transition group-hover:text-[#75babc]">
                  Kā tas darbojas
                  <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </section>
          </ScrollReveal>
        </div>
        <ScrollReveal effect="rise">
          <PilotResultsSection />
        </ScrollReveal>
        <ClosingSections />

      </main>
    </div>
  );
}

function HeroHeader({
  pinned,
  heroRef,
  meetsDashboard,
  standalone = false,
}: {
  pinned: boolean;
  heroRef: React.RefObject<HTMLElement | null>;
  meetsDashboard: boolean;
  standalone?: boolean;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    // Pinned: the nav keeps its full-width top state for the whole hero -
    // through the still pin and the scroll that carries the dashboard away -
    // and only collapses into the compact pill once the next section reaches
    // the top. Tied to the hero's actual bottom edge rather than a viewport
    // count, so it stays correct if the runway length ever changes. An
    // observer keeps this off the scroll path: no layout reads while scrolling.
    const hero = heroRef.current;

    if (pinned && hero) {
      const observer = new IntersectionObserver(
        ([entry]) => setIsScrolled(!entry.isIntersecting),
        { rootMargin: "-80px 0px 0px 0px", threshold: 0 },
      );

      observer.observe(hero);
      return () => observer.disconnect();
    }

    const handleScroll = () =>
      setIsScrolled(window.scrollY > (standalone ? 0 : 50));
    const handleScrollIntent = (event: WheelEvent) => {
      if (standalone && event.deltaY > 0) setIsScrolled(true);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleScrollIntent, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleScrollIntent);
    };
  }, [pinned, heroRef, standalone]);

  // Clicking the mark while already on the landing page used to fire a
  // same-route navigation: the scroll jumped to the top, but the header's
  // observers never saw a scroll, so the nav stayed stuck in its compact pill.
  // Scrolling instead keeps the header driven by real scroll position.
  const handleHomeClick = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (window.location.pathname !== "/") return;

      event.preventDefault();
      setMenuOpen(false);

      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }

      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    },
    [],
  );

  React.useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  React.useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  // Solid pill either once the hero is behind us, or the moment the rising
  // dashboard reaches the nav - a transparent bar sitting on the dashboard's
  // own header is the ugly overlap.
  const compact = isScrolled || meetsDashboard;

  const openPilot = React.useCallback(() => {
    setMenuOpen(false);
    const pilotSection = document.getElementById("pilots");

    if (!pilotSection) {
      window.location.assign("/#pilots");
      return;
    }

    if (window.location.hash !== "#pilots") {
      window.history.pushState(null, "", "#pilots");
    }

    pilotSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  return (
    <header>
      <nav
        data-state={menuOpen ? "active" : "inactive"}
        className="group fixed z-50 w-full px-2 sm:px-3"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl rounded-2xl border border-white/10 bg-[#0b0d10] px-3 shadow-[0_12px_40px_rgba(0,0,0,0.28)] transition-all duration-300 sm:px-6 lg:px-12",
            // At the top of the page the bar is transparent on every viewport,
            // not just lg - on phones it stayed a solid pill over the hero.
            !compact &&
              "mt-3 rounded-none border-transparent bg-transparent shadow-none",
            compact && "max-w-4xl lg:px-5",
            standalone && "duration-150",
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="Shadowy home"
                onClick={handleHomeClick}
                className="flex items-center gap-2"
              >
                <Image
                  src="/shadowy.svg"
                  alt=""
                  width={28}
                  height={28}
                  priority
                  className="size-7 dark:invert-0"
                />
                <span className="font-semibold">Shadowy</span>
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="mobile-navigation"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="relative z-20 -mr-2 grid size-11 cursor-pointer place-items-center rounded-xl text-white transition hover:bg-white/[0.06] lg:hidden"
              >
                <Menu
                  className={cn(
                    "m-auto size-6 duration-200",
                    menuOpen && "rotate-180 scale-0 opacity-0",
                  )}
                />
                <X
                  className={cn(
                    "absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200",
                    menuOpen && "rotate-0 scale-100 opacity-100",
                  )}
                />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden h-fit w-fit -translate-x-10 lg:block xl:-translate-x-14">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item) => (
                  <li
                    key={item.name}
                    className={item.href === "/ka-tas-darbojas" ? "group/how relative" : undefined}
                  >
                    <Link
                      href={standalone && item.href.startsWith("#") ? `/${item.href}` : item.href}
                      className={cn(
                        "flex items-center gap-1 duration-150",
                        standalone
                          ? "text-white/78 [text-shadow:0_1px_8px_rgba(0,0,0,0.95)] hover:text-white"
                          : "text-muted-foreground hover:text-accent-foreground",
                      )}
                    >
                      {item.name}
                      {item.href === "/ka-tas-darbojas" && (
                        <ChevronDown
                          className="size-3.5 transition-transform duration-200 group-hover/how:rotate-180 group-focus-within/how:rotate-180"
                          aria-hidden
                        />
                      )}
                    </Link>

                    {item.href === "/ka-tas-darbojas" && (
                      <div className="invisible absolute left-1/2 top-full w-[305px] -translate-x-1/2 pt-3 opacity-0 transition-opacity duration-100 group-hover/how:visible group-hover/how:opacity-100 group-focus-within/how:visible group-focus-within/how:opacity-100">
                        <div className="overflow-hidden rounded-b-[16px] rounded-t-[7px] border border-white/[0.13] bg-[rgba(11,14,17,0.93)] shadow-[0_20px_55px_rgba(0,0,0,0.48)]">
                          <div className="h-px bg-[linear-gradient(90deg,transparent,#75babc_50%,transparent)] opacity-60" />
                          <div className="flex flex-col px-2 py-2.5">
                            {howItWorksMenuItems.map((menuItem) => {
                              const MenuIcon = menuItem.icon;

                              return (
                              <Link
                                key={menuItem.href}
                                href={menuItem.href}
                                className="how-menu-item group/item flex min-h-12 items-center gap-3.5 rounded-[8px] px-4 py-2.5 font-sans text-[15px] font-medium text-white/52 transition-all hover:bg-white/[0.045] hover:text-white/90"
                              >
                                <MenuIcon
                                  data-how-motion={menuItem.motion}
                                  className="how-menu-icon size-[19px] shrink-0 text-white/30 transition-colors group-hover/item:text-[#75babc]"
                                  strokeWidth={1.65}
                                  aria-hidden
                                />
                                <span>{menuItem.title}</span>
                              </Link>
                              );
                            })}
                          </div>

                          <div className="border-t border-white/[0.08] p-2">
                            <Link
                              href="/ka-tas-darbojas"
                              className="group/all flex min-h-11 items-center gap-3.5 rounded-[8px] px-4 py-2.5 font-sans text-sm font-medium text-white/42 transition-all hover:bg-white/[0.045] hover:text-white/85"
                            >
                              <ArrowUpRight className="size-[18px] text-white/28 transition-colors group-hover/all:text-[#75babc]" aria-hidden />
                              Visas sadaļas
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden items-center gap-6 lg:flex">
              <div className="flex items-center gap-3">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  // Overrides must carry the dark: prefix - the outline variant
                  // sets its colours under dark:, which outranks a plain class.
                  className="h-8 font-semibold text-white transition-colors dark:border-white/25 dark:bg-[#22262b] dark:hover:border-white/45 dark:hover:bg-[#2d3238] dark:hover:text-white"
                >
                  <Link href="/login">Pieslēgties</Link>
                </Button>
                <ButtonColorful
                  type="button"
                  label="Pieteikt pilotu"
                  onClick={openPilot}
                  className="h-8 rounded-lg px-3 text-[13px]"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Mobilā navigācija"
          className="fixed inset-0 z-[100] min-h-[100dvh] overflow-y-auto overscroll-contain bg-[#07090b] p-3 lg:hidden"
        >
          <div
            aria-hidden
            className="landing-grain-overlay pointer-events-none absolute inset-0 z-0"
            style={{ opacity: 0.34 }}
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-28 -top-24 size-80 rounded-full bg-[#75babc]/[0.1] blur-[90px]" />
            <div className="absolute -bottom-36 -left-28 size-80 rounded-full bg-violet-500/[0.08] blur-[100px]" />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-md items-center justify-between px-1 py-1">
            <Link
              href="/"
              aria-label="Shadowy home"
              onClick={handleHomeClick}
              className="flex items-center gap-2.5"
            >
              <Image src="/shadowy.svg" alt="" width={34} height={34} />
              <span className="text-lg font-semibold text-white">Shadowy</span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              autoFocus
              className="grid size-12 place-items-center rounded-2xl border border-white/[0.12] bg-white/[0.065] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:bg-white/[0.1] active:scale-95 [@media(max-height:560px)]:size-10"
            >
              <X className="size-6" />
            </button>
          </div>

          {/* Everything below tightens under 560px of viewport height. That is
              a phone held sideways: at full size only two of the four links
              fit above the buttons, and the rest were only reachable by
              scrolling a list that gives no sign it scrolls. */}
          <div className="relative z-10 mx-auto mt-5 w-full max-w-md animate-in overflow-hidden rounded-[26px] border border-white/[0.11] bg-[#0a0d10]/95 p-3 shadow-[0_28px_90px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.05)] duration-300 fade-in slide-in-from-bottom-3 [@media(max-height:560px)]:mt-3">
            <div className="px-3 pb-3 pt-2 [@media(max-height:560px)]:hidden">
              <p className="font-accent text-[10px] font-semibold uppercase tracking-[0.18em] text-[#75babc]">
                Navigācija
              </p>
              <p className="mt-1.5 font-sans text-sm text-white/42">
                Izvēlieties, kur vēlaties doties
              </p>
            </div>
            {/* The link list is the part that gives way when the sheet cannot
                fit: min-h-0 lets this box shrink, so without a scroller of its
                own the <ul> spilled straight out of it. On a phone held
                sideways that put FAQ underneath the two buttons and pushed
                Privātums off the screen entirely, clipped by the outer
                overflow-hidden. Scrolling here keeps the CTAs parked at the
                bottom on any viewport height. */}
            <nav
              aria-label="Mobilā izvēlne"
              className="min-h-0"
            >
              <ul className="grid gap-2">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={standalone && item.href.startsWith("#") ? `/${item.href}` : item.href}
                      onClick={() => setMenuOpen(false)}
                      className="group flex min-h-[68px] items-center gap-4 rounded-2xl border border-transparent px-3 py-2.5 transition-all hover:border-white/[0.08] hover:bg-white/[0.05] active:scale-[0.99] [@media(max-height:560px)]:min-h-[48px] [@media(max-height:560px)]:py-1.5"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] font-mono text-[10px] text-[#75babc]/70 transition-colors group-hover:border-[#75babc]/25 group-hover:text-[#75babc] [@media(max-height:560px)]:size-8">
                        {item.number}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-[17px] font-semibold text-white/84 transition-colors group-hover:text-white [@media(max-height:560px)]:text-[15px]">
                          {item.name}
                        </span>
                        <span className="mt-0.5 block font-sans text-xs text-white/34 [@media(max-height:560px)]:hidden">
                          {item.caption}
                        </span>
                      </span>
                      <ArrowUpRight className="size-4 text-white/22 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#75babc]" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/[0.09] pt-3">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex h-12 items-center justify-center rounded-xl border border-white/[0.13] bg-white/[0.045] font-display text-sm font-semibold text-white transition hover:bg-white/[0.08] [@media(max-height:560px)]:h-10"
              >
                Pieslēgties
              </Link>
              <button
                type="button"
                onClick={openPilot}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-3 font-display text-sm font-bold text-[#090b0d] shadow-[0_10px_32px_rgba(255,255,255,0.12)] transition hover:bg-white/90 active:scale-[0.985] [@media(max-height:560px)]:h-10"
              >
                Pieteikt pilotu <ArrowUpRight className="size-4" aria-hidden />
              </button>
            </div>
          </div>
          <p className="relative z-10 mx-auto mt-5 max-w-md text-center font-sans text-[11px] tracking-[0.06em] text-white/24 [@media(max-height:560px)]:hidden">
            Redziet neredzamo darbu. Uzlabojiet procesus.
          </p>
        </div>
      )}
    </header>
  );
}

export function LandingNavbar() {
  const detachedHeroRef = React.useRef<HTMLElement | null>(null);

  return (
    <HeroHeader
      pinned={false}
      heroRef={detachedHeroRef}
      meetsDashboard={false}
      standalone
    />
  );
}
