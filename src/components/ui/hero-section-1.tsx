"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Menu,
  X,
} from "lucide-react";
import { type Variants } from "framer-motion";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Button } from "@/components/ui/button";
import { ButtonColorful } from "@/components/ui/button-colorful";
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
    hidden: { opacity: 0, filter: "blur(12px)", y: 12 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
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
  return (
    <div className="relative isolate min-h-[100svh] overflow-hidden bg-[#070809] text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[980px]"
        style={{
          background:
            "radial-gradient(30% 25% at 17% 30%, rgba(24, 68, 138, 0.27) 0%, rgba(14, 40, 86, 0.10) 48%, transparent 78%), radial-gradient(28% 24% at 82% 29%, rgba(15, 100, 72, 0.25) 0%, rgba(10, 56, 44, 0.09) 48%, transparent 80%), radial-gradient(32% 27% at 35% 68%, rgba(14, 91, 69, 0.22) 0%, rgba(8, 51, 42, 0.08) 50%, transparent 82%), radial-gradient(31% 26% at 70% 72%, rgba(23, 62, 130, 0.25) 0%, rgba(12, 35, 78, 0.09) 50%, transparent 80%), radial-gradient(39% 38% at -2% 90%, rgba(20, 116, 80, 0.31) 0%, rgba(10, 59, 44, 0.12) 48%, transparent 82%), radial-gradient(47% 44% at 103% 82%, rgba(30, 77, 151, 0.31) 0%, rgba(14, 42, 93, 0.13) 50%, transparent 82%), radial-gradient(45% 24% at 50% 0%, rgba(255, 255, 255, 0.018) 0%, transparent 72%), linear-gradient(180deg, #060708 0%, #070809 58%, #080a0d 100%)",
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
      <HeroHeader />
      <main className="overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2] isolate hidden opacity-30 lg:block"
        >
          <div className="absolute left-[-14rem] top-[-31rem] h-[80rem] w-[35rem] -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(255,255,255,.055)_0,rgba(255,255,255,.012)_50%,transparent_80%)]" />
        </div>

        <section className="relative z-20">
          <div className="relative pt-16 sm:pt-32 md:pt-36">
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

            <div className="flex min-h-[85svh] flex-col justify-center sm:block sm:min-h-0">
              <div className="relative -top-8 mx-auto max-w-[1500px] px-4 pb-0 sm:top-0 sm:px-6">
                <div className="relative left-4 mx-auto w-full max-w-[460px] font-accent font-light text-left sm:left-0 sm:max-w-none sm:text-center lg:mr-auto lg:mt-0">
                <AnimatedGroup
                  variants={transitionVariants}
                  className="relative z-20 translate-x-2 sm:translate-x-0"
                >
                  <h1 className="mx-0 mt-4 max-w-6xl text-balance bg-[linear-gradient(90deg,#f8fafc_0%,#f8fafc_42%,rgba(226,232,240,.82)_70%,rgba(148,163,184,.52)_100%)] bg-clip-text text-[clamp(2.35rem,10vw,3.6rem)] font-bold leading-[0.98] tracking-[0.005em] text-transparent [font-synthesis:weight] sm:mx-auto sm:mt-8 sm:text-[clamp(3.2rem,7vw,5rem)] lg:mt-16 lg:text-[clamp(4rem,5.4vw,5.8rem)]">
                    <span className="sm:hidden">
                      Padariet neredzamo{" "}
                      <span className="bg-[linear-gradient(90deg,#6ee7b7_0%,#ffffff_100%)] bg-clip-text text-transparent">
                        darbu redzamu
                      </span>
                    </span>
                    <span className="hidden sm:inline">Pārvērtiet neredzamo darbu redzamās izmaksās un labākos lēmumos</span>
                  </h1>
                  <p className="mx-0 mt-6 max-w-3xl text-balance text-base leading-7 tracking-[0.01em] text-white/55 sm:mx-auto sm:mt-8 sm:text-lg sm:leading-relaxed md:text-xl">
                    Shadowy parāda, kur komandā{" "}
                    <strong className="font-semibold text-white/75 [font-synthesis:weight]">
                      pazūd laiks, nauda un fokuss
                    </strong>
                    {" "}- bez darbinieku kontroles. Darbinieki apraksta situācijas saviem vārdiem. Shadowy pārvērš tās{" "}
                    <strong className="font-semibold text-white/75 [font-synthesis:weight]">
                      datos par slēpto slodzi, izmaksām un procesu uzlabojumiem.
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
                  <ButtonColorful
                    type="button"
                    label="Sākt 30 dienu bezmaksas pilotu"
                    onClick={() => {
                      if (window.location.hash !== "#pilots") {
                        window.history.pushState(null, "", "#pilots");
                      }

                      document.getElementById("pilots")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                    className="h-[52px] w-[92%] max-w-full touch-pan-y rounded-xl px-6 text-[14px] font-bold sm:w-auto sm:px-7 sm:text-[15px]"
                  />
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
              <div className="relative -mt-40 overflow-visible px-4 pb-10 sm:mt-12 sm:overflow-hidden sm:px-6 sm:pb-16 md:mt-20">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 hidden bg-[linear-gradient(to_bottom,transparent_0%,transparent_68%,rgba(7,9,12,0.45)_84%,#07090c_100%)] sm:block"
                />
                <div className="hidden sm:block relative mx-auto max-w-4xl overflow-hidden rounded-xl border bg-background p-1.5 shadow-lg shadow-zinc-950/15 ring-1 ring-background sm:rounded-2xl sm:p-4 dark:shadow-[inset_0_1px_rgba(255,255,255,0.2)]">
                  <LiveDashboardPreview />
                </div>
                <div className="sm:hidden">
                  <MobileDashboardPreview />
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>

        <ScrollReveal effect="rise" disableOnMobile>
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

  return (
    <header>
      <nav
        data-state={menuOpen ? "active" : "inactive"}
        className="group fixed z-50 w-full px-2 sm:px-3"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl rounded-2xl px-3 transition-all duration-300 sm:px-6 lg:px-12",
            isScrolled &&
              "max-w-4xl border border-white/10 bg-[#090b0e]/85 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:px-5",
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

            <div
              id="mobile-navigation"
              className={cn(
                "mb-2 w-full flex-wrap items-center justify-end rounded-2xl border border-white/10 bg-[#0a0d10]/95 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none",
                menuOpen ? "flex" : "hidden",
              )}
            >
              <div className="w-full lg:hidden">
                <ul className="space-y-1 text-base">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-xl px-3 py-3 text-white/70 transition hover:bg-white/[0.05] hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-3 flex w-full flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row md:w-fit lg:mt-0 lg:border-0 lg:pt-0">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-11 w-full sm:w-auto lg:h-8"
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
                  className={cn(
                    "h-11 w-full rounded-lg px-4 text-sm sm:w-auto lg:h-8 lg:px-3 lg:text-[13px]",
                  )}
                />
                <Button
                  asChild
                  size="sm"
                  className="hidden"
                >
                  <Link href="/register">Pieteikt pilotu</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
