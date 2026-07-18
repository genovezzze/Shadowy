"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  CheckCircle2,
  Menu,
  X,
} from "lucide-react";
import { type Variants } from "framer-motion";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Button } from "@/components/ui/button";
import { ButtonColorful } from "@/components/ui/button-colorful";
import { GradientButton } from "@/components/ui/gradient-button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { AnnaStoryCarousel } from "@/components/landing/anna-story-carousel";
import { HiddenCostSection } from "@/components/landing/hidden-cost-section";
import { SolutionSection } from "@/components/landing/solution-section";
import { BusinessValueSection } from "@/components/landing/business-value-section";
import { EmployeeValueSection } from "@/components/landing/employee-value-section";
import { WhatToLogSection } from "@/components/landing/what-to-log-section";
import { PilotResultsSection } from "@/components/landing/pilot-results-section";
import { PrivacyTrustSection } from "@/components/landing/privacy-trust-section";
import { ClosingSections } from "@/components/landing/closing-sections";
import { LiveDashboardPreview } from "@/components/landing/live-dashboard-preview";
import { MobileDashboardPreview } from "@/components/landing/mobile-dashboard-preview";
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
  { name: "Kā tas darbojas", href: "#risinajums" },
  { name: "Pilots", href: "#pilots" },
  { name: "FAQ", href: "#faq" },
  { name: "Privātums", href: "#privatums" },
];

export function HeroSection() {
  const [previewMode, setPreviewMode] = React.useState<
    "mobile" | "desktop" | null
  >(null);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const updatePreviewMode = () =>
      setPreviewMode(mediaQuery.matches ? "mobile" : "desktop");

    updatePreviewMode();
    mediaQuery.addEventListener("change", updatePreviewMode);
    return () => mediaQuery.removeEventListener("change", updatePreviewMode);
  }, []);

  return (
    <div className="relative isolate min-h-screen min-h-[100svh] overflow-hidden bg-[#070809] text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[980px]"
        style={{
          background:
            "radial-gradient(30% 25% at 17% 30%, rgba(10, 74, 52, 0.22) 0%, rgba(7, 43, 33, 0.09) 48%, transparent 78%), radial-gradient(28% 24% at 82% 29%, rgba(15, 100, 72, 0.25) 0%, rgba(10, 56, 44, 0.09) 48%, transparent 80%), radial-gradient(32% 27% at 35% 68%, rgba(14, 91, 69, 0.22) 0%, rgba(8, 51, 42, 0.08) 50%, transparent 82%), radial-gradient(31% 26% at 70% 72%, rgba(10, 72, 51, 0.2) 0%, rgba(7, 42, 32, 0.08) 50%, transparent 80%), radial-gradient(39% 38% at -2% 90%, rgba(20, 116, 80, 0.31) 0%, rgba(10, 59, 44, 0.12) 48%, transparent 82%), radial-gradient(47% 44% at 103% 82%, rgba(9, 70, 48, 0.25) 0%, rgba(6, 39, 29, 0.11) 50%, transparent 82%), radial-gradient(45% 24% at 50% 0%, rgba(255, 255, 255, 0.018) 0%, transparent 72%), linear-gradient(180deg, #060708 0%, #070809 58%, #080a0d 100%)",
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
      <div
        aria-hidden
        className="landing-grain-overlay pointer-events-none absolute inset-0 z-[60]"
      />
      <HeroHeader />
      <main className="overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2] isolate hidden opacity-30 lg:block"
        >
          <div className="absolute left-[-14rem] top-[-31rem] h-[80rem] w-[35rem] -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(255,255,255,.055)_0,rgba(255,255,255,.012)_50%,transparent_80%)]" />
        </div>

        <section className="relative z-20">
          <div className="relative pt-16 sm:pt-28 md:pt-32 lg:pt-36">
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

            <div
              aria-hidden
              className="absolute inset-0 -z-10 h-full w-full [background:radial-gradient(115%_95%_at_50%_100%,transparent_0%,rgba(7,8,9,.16)_50%,#070809_90%)]"
            />

            <div className="pt-28 sm:block sm:pt-0">
              <div className="relative mx-auto max-w-[1500px] px-4 pb-0 sm:px-6 xl:px-10 2xl:px-14">
                <div className="relative left-2 mx-auto w-full max-w-[460px] font-accent font-light text-left sm:left-0 sm:max-w-none sm:text-center lg:mr-auto lg:mt-0">
                <AnimatedGroup
                  variants={transitionVariants}
                  className="relative z-20 sm:translate-x-0"
                >
                  <h1 className="mx-0 mt-4 max-w-6xl text-balance bg-[linear-gradient(90deg,#f8fafc_0%,#f8fafc_42%,rgba(226,232,240,.82)_70%,rgba(148,163,184,.52)_100%)] bg-clip-text text-[clamp(2.15rem,9vw,3.2rem)] font-bold leading-[0.98] tracking-[0.005em] text-transparent [font-synthesis:weight] sm:mx-auto sm:mt-8 sm:text-[clamp(2.75rem,7vw,5rem)] lg:mt-14 lg:text-[clamp(3.6rem,5.2vw,5.6rem)] xl:mt-16">
                    <span className="sm:hidden">
                      Redziet darbu, kas netiek uzskaitīts, bet{" "}
                      <span className="animate-solution-heading-green bg-clip-text text-transparent">
                        maksā uzņēmumam
                      </span>
                    </span>
                    <span className="hidden sm:inline">Pārvērtiet neredzamo darbu redzamās izmaksās un labākos lēmumos</span>
                  </h1>
                  <p className="mx-0 mt-6 max-w-3xl text-balance text-base leading-7 tracking-[0.01em] text-white/55 sm:mx-auto sm:mt-8 sm:text-lg sm:leading-relaxed md:text-xl">
                    Shadowy palīdz pamanīt darbu,{" "}
                    <strong className="font-semibold text-white/75 [font-synthesis:weight]">
                      kas ikdienā paliek neuzskaitīts
                    </strong>
                    {" "}- palīdzību kolēģiem, steidzamus uzdevumus, gaidīšanu un darbu ārpus savas lomas. Darbinieks situāciju{" "}
                    <strong className="font-semibold text-white/75 [font-synthesis:weight]">
                      īsi apraksta vai ierunā
                    </strong>
                    , bet Shadowy pārvērš to datos, kas parāda{" "}
                    <strong className="font-semibold text-white/75 [font-synthesis:weight]">
                      papildu slodzi, zaudēto laiku un izmaksas uzņēmumam.
                    </strong>
                  </p>
                </AnimatedGroup>

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
                  className="relative z-40 mt-8 flex w-full flex-col items-center justify-center gap-3 [&>div]:w-full [&>div]:self-start sm:mt-10 sm:[&>div]:w-auto sm:[&>div]:self-auto md:flex-row"
                >
                  <div
                    className="mobile-hero-cta-shell !w-[88%] !self-center sm:!w-auto sm:!self-auto"
                    style={{ backgroundImage: "url('/images/cards_back.png?v=3')" }}
                  >
                    <GradientButton
                      type="button"
                      variant="mobileCta"
                      onClick={() => {
                        if (window.location.hash !== "#pilots") {
                          window.history.pushState(null, "", "#pilots");
                        }

                        document.getElementById("pilots")?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                      className="h-[50px] w-full touch-pan-y gap-2 px-4 text-[13px] sm:h-[52px] sm:w-auto sm:px-7 sm:text-[15px]"
                    >
                      <span>Sākt 30 dienu bezmaksas pilotu</span>
                      <ArrowUpRight aria-hidden className="size-3.5" />
                    </GradientButton>
                  </div>
                  <Link
                    href="#hidden-cost-calculator"
                    className="hidden h-[52px] w-full max-w-sm items-center justify-center rounded-xl border border-white/[0.14] bg-white/[0.025] px-6 text-[14px] font-bold text-white/82 transition hover:border-white/25 hover:bg-white/[0.06] hover:text-white sm:inline-flex sm:w-auto sm:px-7 sm:text-[15px]"
                  >
                    Aprēķināt slēptā darba izmaksas
                  </Link>
                </AnimatedGroup>
                <p className="mx-auto mt-4 hidden max-w-sm text-balance text-center text-sm leading-6 tracking-[0.01em] text-white/55 sm:mt-5 sm:block sm:max-w-none sm:text-base">
                  <CheckCircle2 className="mb-0.5 mr-1.5 inline-block size-4 shrink-0 align-middle text-emerald-400" />
                  <strong className="font-bold text-white/72 [font-synthesis:weight]">
                    Bez kredītkartes. Bez saistībām.
                  </strong>{" "}
                  Iestatīšana{" "}
                  <strong className="font-bold text-white/72 [font-synthesis:weight]">
                    līdz 10 minūtēm.
                  </strong>
                </p>
              </div>
              </div>
            </div>

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
              <div className="relative mt-0 overflow-visible px-4 pb-10 sm:mt-12 sm:overflow-hidden sm:px-6 sm:pb-16 md:mt-20">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 hidden bg-[linear-gradient(to_bottom,transparent_0%,transparent_68%,rgba(7,8,9,0.45)_84%,#070809_100%)] sm:block"
                />
                <div className="hidden sm:block relative mx-auto max-w-4xl overflow-hidden rounded-xl border bg-background p-1.5 shadow-lg shadow-zinc-950/15 ring-1 ring-background sm:rounded-2xl sm:p-4 dark:shadow-[inset_0_1px_rgba(255,255,255,0.2)]">
                  {previewMode === "desktop" ? (
                    <LiveDashboardPreview />
                  ) : (
                    <div className="aspect-video w-full" />
                  )}
                </div>
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

        <ScrollReveal effect="rise" disableOnMobile className="relative z-30">
          <AnnaStoryCarousel />
        </ScrollReveal>
        <ScrollReveal effect="blur">
          <HiddenCostSection />
        </ScrollReveal>
        <ScrollReveal effect="focus">
          <SolutionSection />
        </ScrollReveal>
        <ScrollReveal effect="zoom">
          <BusinessValueSection />
        </ScrollReveal>
        <ScrollReveal effect="blur">
          <EmployeeValueSection />
        </ScrollReveal>
        <ScrollReveal effect="fade">
          <WhatToLogSection />
        </ScrollReveal>
        <ScrollReveal effect="unfold" disableOnMobile>
          <PrivacyTrustSection />
        </ScrollReveal>
        <ScrollReveal effect="rise">
          <PilotResultsSection />
        </ScrollReveal>
        <ClosingSections />

      </main>
    </div>
  );
}

function HeroHeader() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  return (
    <header>
      <nav
        data-state={menuOpen ? "active" : "inactive"}
        className="group fixed z-50 w-full px-2 sm:px-3"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl rounded-2xl border border-white/10 bg-[#0b0d10] px-3 shadow-[0_12px_40px_rgba(0,0,0,0.28)] transition-all duration-300 sm:px-6 lg:px-12",
            !isScrolled &&
              "lg:mt-3 lg:rounded-none lg:border-transparent lg:bg-transparent lg:shadow-none",
            isScrolled &&
              "max-w-4xl lg:px-5",
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link href="/" aria-label="Shadowy home" className="flex items-center gap-2">
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

            <div className="absolute inset-0 m-auto hidden h-fit w-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="block text-muted-foreground duration-150 hover:text-accent-foreground"
                    >
                      {item.name}
                    </Link>
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
                  className="h-8"
                >
                  <Link href="/login">Pieslēgties</Link>
                </Button>
                <ButtonColorful
                  type="button"
                  label="Pieteikt pilotu"
                  onClick={() => {
                    setMenuOpen(false);
                    const pilotSection = document.getElementById("pilots");

                    if (window.location.hash !== "#pilots") {
                      window.history.pushState(null, "", "#pilots");
                    }

                    pilotSection?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
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
          className="fixed inset-0 z-[100] flex min-h-[100dvh] flex-col overflow-hidden bg-[#07090b] p-3 lg:hidden"
        >
          <div
            aria-hidden
            className="landing-grain-overlay pointer-events-none absolute inset-0 z-0"
            style={{ opacity: 0.34 }}
          />

          <div className="relative z-10 flex items-center justify-between px-2 py-2">
            <Link
              href="/"
              aria-label="Shadowy home"
              onClick={() => setMenuOpen(false)}
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
              className="grid size-12 place-items-center rounded-xl border border-white/10 bg-white/[0.07] text-white transition active:scale-95"
            >
              <X className="size-6" />
            </button>
          </div>

          <div className="relative z-10 mt-4 flex min-h-0 flex-1 animate-in flex-col rounded-[22px] border border-white/10 bg-[#0a0d10] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.48)] duration-300 fade-in slide-in-from-bottom-2">
            <nav aria-label="Mobilā izvēlne" className="min-h-0 flex-1">
              <ul className="divide-y divide-white/[0.07]">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="group flex items-center justify-between rounded-xl px-4 py-4 text-lg font-semibold text-white/72 transition hover:bg-white/[0.045] hover:text-white"
                    >
                      <span>{item.name}</span>
                      <span
                        aria-hidden
                        className="text-emerald-300/0 transition group-hover:text-emerald-300/80"
                      >
                        ↗
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-4 grid gap-3 border-t border-white/10 pt-4">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex h-12 items-center justify-center rounded-xl border border-white/[0.14] bg-white/[0.045] text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Pieslēgties
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);

                  if (window.location.hash !== "#pilots") {
                    window.history.pushState(null, "", "#pilots");
                  }

                  requestAnimationFrame(() => {
                    document.getElementById("pilots")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  });
                }}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-[#090b0d] shadow-[0_10px_32px_rgba(255,255,255,0.12)] transition active:scale-[0.985]"
              >
                Pieteikt pilotu <span aria-hidden>↗</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
