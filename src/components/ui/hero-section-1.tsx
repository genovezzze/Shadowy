"use client";

import React from "react";
import Link from "next/link";
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
import { SolutionSection } from "@/components/landing/solution-section";
import { BusinessValueSection } from "@/components/landing/business-value-section";
import { PrivacyTrustSection } from "@/components/landing/privacy-trust-section";
import { ClosingSections } from "@/components/landing/closing-sections";
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
    <div className="relative isolate min-h-screen overflow-hidden bg-[#070809] text-foreground">
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

        <section>
          <div className="relative pt-24 md:pt-36">
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

            <div className="mx-auto max-w-[1500px] px-6">
              <div className="font-accent font-light text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <AnimatedGroup variants={transitionVariants}>
                  <div
                    aria-hidden
                    className="hidden"
                  >
                    <span className="hidden">
                      30 dienu pilots bez novērošanas
                    </span>
                    <img
                      src="/shadowy.svg"
                      alt=""
                      className="size-full object-contain"
                    />
                  </div>

                  <h1 className="mx-auto mt-8 max-w-none whitespace-nowrap bg-[linear-gradient(90deg,#f8fafc_0%,#f8fafc_38%,rgba(226,232,240,.82)_68%,rgba(96,165,250,.42)_100%)] bg-clip-text text-[clamp(1rem,5vw,5rem)] font-bold leading-[1.05] tracking-[0.03em] text-transparent [font-synthesis:weight] lg:mt-16">
                    Padariet neredzamo darbu redzamu
                  </h1>
                  <p className="mx-auto mt-8 max-w-4xl text-balance text-xl leading-relaxed tracking-[0.015em] text-white/85 md:text-2xl">
                    Shadowy palīdz uzņēmumiem pamanīt{" "}
                    <strong className="font-bold [font-synthesis:weight]">
                      slēpto darba slodzi, papildu pienākumus un darbu ārpus
                      oficiālās lomas
                    </strong>{" "}
                    - bez darbinieku novērošanas
                  </p>
                  <p className="mx-auto mt-4 max-w-4xl text-balance text-lg tracking-[0.015em] text-white/70 md:text-xl">
                    Sāciet ar vienu komandu un{" "}
                    <strong className="font-bold [font-synthesis:weight]">
                      saņemiet praktisku pārskatu pēc 30 dienām
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
                  className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
                >
                  <ButtonColorful
                    type="button"
                    label="Izmēģināt BEZMAKSAS"
                    onClick={() => {
                      window.location.href = "/register";
                    }}
                    className="h-[52px] rounded-xl px-7 text-base font-bold"
                  />
                </AnimatedGroup>
                <p className="mx-auto mt-5 flex w-fit items-center gap-2 text-base tracking-[0.012em] text-white/55">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  Bez kredītkartes. Bez saistībām. Iestatīšana līdz 10 minūtēm
                </p>
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
            >
              <div className="relative -mr-56 mt-8 overflow-hidden px-2 pb-12 sm:mr-0 sm:mt-12 sm:pb-16 md:mt-20">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_bottom,transparent_0%,transparent_68%,rgba(7,9,12,0.45)_84%,#07090c_100%)]"
                />
                <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border bg-background p-4 shadow-lg shadow-zinc-950/15 ring-1 ring-background dark:shadow-[inset_0_1px_rgba(255,255,255,0.2)]">
                  <img
                    className="relative aspect-video w-full rounded-2xl border border-border/25 object-cover"
                    src="/images/shadowy-dashboard.png"
                    alt="Shadowy darba pārskats klēpjdatora ekrānā"
                    width="1672"
                    height="941"
                  />
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>

        <ScrollReveal effect="rise">
          <AnnaStoryCarousel />
        </ScrollReveal>
        <ScrollReveal effect="left">
          <SolutionSection />
        </ScrollReveal>
        <ScrollReveal effect="zoom">
          <BusinessValueSection />
        </ScrollReveal>
        <ScrollReveal effect="right">
          <PrivacyTrustSection />
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

  return (
    <header>
      <nav
        data-state={menuOpen ? "active" : "inactive"}
        className="group fixed z-20 w-full px-2"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "max-w-4xl rounded-2xl border bg-background/50 backdrop-blur-lg lg:px-5",
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link href="/" aria-label="Shadowy home" className="flex items-center gap-2">
                <img src="/shadowy.svg" alt="" className="size-7 dark:invert-0" />
                <span className="font-semibold">Shadowy</span>
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
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
              className={cn(
                "mb-6 hidden w-full flex-wrap items-center justify-end rounded-3xl border bg-background p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none",
                menuOpen && "flex",
              )}
            >
              <div className="w-full lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-muted-foreground">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col gap-3 sm:flex-row md:w-fit">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
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
                    "h-8 rounded-lg px-3 text-[13px]",
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
