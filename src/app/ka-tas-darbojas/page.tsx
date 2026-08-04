import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Linkedin, Mail } from "lucide-react";
import { AnnaStoryCarousel } from "@/components/landing/anna-story-carousel";
import { CompanyValueSection } from "@/components/landing/company-value-section";
import { EmployeeValueSection } from "@/components/landing/employee-value-section";
import { HowItWorksHero } from "@/components/landing/how-it-works-hero";
import { PrivacyTrustSection } from "@/components/landing/privacy-trust-section";
import { ShadowyExplainerSection } from "@/components/landing/shadowy-explainer-section";
import { SolutionSection } from "@/components/landing/solution-section";
import { WhatToLogSection } from "@/components/landing/what-to-log-section";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { LandingNavbar } from "@/components/ui/hero-section-1";

export const metadata: Metadata = {
  title: "Kā tas darbojas | Shadowy",
  description:
    "Uzziniet, kā Shadowy palīdz komandām fiksēt neredzamo darbu, analizēt slodzi un ieraudzīt slēptās izmaksas.",
};

export default function HowItWorksPage() {
  return (
    <div className="dark min-h-screen bg-[#070809] text-white">
      <LandingNavbar />
      <main>
        <HowItWorksHero />

        <ScrollReveal effect="fade">
          <ShadowyExplainerSection />
        </ScrollReveal>

        <ScrollReveal effect="rise" disableOnMobile className="relative z-30">
          <AnnaStoryCarousel />
        </ScrollReveal>
        <ScrollReveal effect="focus">
          <SolutionSection />
        </ScrollReveal>
        <ScrollReveal effect="blur">
          <EmployeeValueSection />
        </ScrollReveal>
        <ScrollReveal effect="blur">
          <CompanyValueSection />
        </ScrollReveal>
        <ScrollReveal effect="fade">
          <WhatToLogSection />
        </ScrollReveal>
        <ScrollReveal effect="unfold" disableOnMobile>
          <PrivacyTrustSection />
        </ScrollReveal>

      </main>

      <footer className="relative border-t border-white/[0.08] bg-black">
        <div className="relative mx-auto max-w-6xl px-5 pb-6 pt-8 sm:px-6 sm:pt-10">
          <div className="grid gap-10 sm:gap-8 lg:grid-cols-[1.35fr_0.65fr_0.8fr]">
            <div className="max-w-md">
              <Link href="/" className="inline-flex items-center gap-2" aria-label="Shadowy sākumlapa">
                <Image src="/shadowy.svg" alt="" width={28} height={28} className="size-7" />
                <span className="font-display text-lg font-semibold text-white">Shadowy</span>
              </Link>

              <p className="mt-3 max-w-sm font-sans text-sm leading-relaxed text-white/48">
                Parādiet, kur pazūd laiks, nauda un komandas fokuss - bez
                darbinieku kontroles
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <a
                  href="mailto:contact@shadowy.lv"
                  className="group inline-flex w-fit items-center gap-2.5 font-sans text-[13px] text-white/55 transition-colors hover:text-white"
                >
                  <span className="grid size-8 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.025] transition-colors group-hover:border-[#75babc]/35 group-hover:text-[#75babc]">
                    <Mail className="size-3.5" aria-hidden />
                  </span>
                  contact@shadowy.lv
                </a>
                <a
                  href="https://www.linkedin.com/in/artemijs-lucins/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex w-fit items-center gap-2.5 font-sans text-[13px] text-white/55 transition-colors hover:text-white"
                >
                  <span className="grid size-8 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.025] transition-colors group-hover:border-[#75babc]/35 group-hover:text-[#75babc]">
                    <Linkedin className="size-3.5" aria-hidden />
                  </span>
                  <span className="flex flex-col">
                    Artemijs Lučins
                    <span className="text-[11px] text-white/30">Founder</span>
                  </span>
                </a>
                <a
                  href="https://www.linkedin.com/company/shadowy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex w-fit items-center gap-2.5 font-sans text-[13px] text-white/55 transition-colors hover:text-white"
                >
                  <span className="grid size-8 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.025] transition-colors group-hover:border-[#75babc]/35 group-hover:text-[#75babc]">
                    <Linkedin className="size-3.5" aria-hidden />
                  </span>
                  Shadowy
                </a>
              </div>
            </div>

            <div>
              <h2 className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                Produkts
              </h2>
              <nav className="mt-3.5 flex flex-col gap-3">
                <Link href="/ka-tas-darbojas" className="w-fit font-sans text-[15px] font-medium text-white/70 transition-colors hover:text-white">
                  Kā tas darbojas
                </Link>
                <Link href="/#pilots" className="w-fit font-sans text-[15px] font-medium text-white/70 transition-colors hover:text-white">
                  Pilots
                </Link>
                <Link href="/login" className="w-fit font-sans text-[15px] font-medium text-white/70 transition-colors hover:text-white">
                  Pieslēgties
                </Link>
              </nav>
            </div>

            <div>
              <h2 className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                Juridiskā informācija
              </h2>
              <nav className="mt-3.5 flex flex-col gap-3">
                <Link href="/privacy" className="w-fit font-sans text-[15px] font-medium text-white/70 transition-colors hover:text-white">
                  Privātuma politika
                </Link>
                <Link href="/privacy#terms" className="w-fit font-sans text-[15px] font-medium text-white/70 transition-colors hover:text-white">
                  Lietošanas noteikumi
                </Link>
              </nav>
            </div>
          </div>

          <div className="mt-9 border-t border-white/[0.07] pt-4 font-sans text-[11px] text-white/30">
            © 2026 Shadowy. Visas tiesības aizsargātas
          </div>
        </div>
      </footer>
    </div>
  );
}
