import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const contentChoices = [
  { number: "01", label: "Problēma", href: "#problema" },
  { number: "02", label: "Kā Shadowy strādā", href: "#risinajums" },
  { number: "03", label: "Darbiniekiem", href: "#darbiniekiem" },
  { number: "04", label: "Uzņēmumam", href: "#uznemumam" },
  { number: "05", label: "Ko fiksēt", href: "#ko-fikset" },
  { number: "06", label: "Privātums", href: "#privatums" },
] as const;

export function HowItWorksHero() {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.08] bg-[#070809] px-5 pb-0 sm:px-6">
      <div className="relative left-1/2 w-screen -translate-x-1/2">
        <div className="relative h-[clamp(430px,56vh,560px)] w-full overflow-hidden">
          <Image
            src="/images/ktd-background.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <h1 className="absolute inset-0 z-10 flex items-center justify-center px-5 text-center font-display text-[clamp(2.8rem,5.8vw,6.5rem)] font-bold tracking-[-0.035em] text-white [text-shadow:0_3px_22px_rgba(0,0,0,0.42)]">
            Kā tas darbojas?
          </h1>
        </div>
      </div>

      <div className="relative left-1/2 z-10 w-screen -translate-x-1/2">
        <div className="bg-[#070809]">
          <p className="border-b border-white/[0.08] px-5 py-3.5 font-accent text-[10px] font-semibold uppercase tracking-[0.14em] text-[#75babc] sm:px-6">
            Izvēlieties, ko vēlaties apskatīt
          </p>
          <nav
            aria-label="Kā tas darbojas sadaļas"
            className="grid sm:grid-cols-2 lg:grid-cols-3"
          >
            {contentChoices.map((choice, index) => (
              <Link
                key={choice.href}
                href={choice.href}
                className={`group flex min-h-16 items-center justify-between gap-4 border-b border-white/[0.07] px-3 py-3 transition-colors hover:bg-white/[0.035] sm:px-4 ${
                  index % 2 === 0 ? "sm:border-r" : ""
                } ${index % 3 !== 2 ? "lg:border-r" : "lg:border-r-0"}`}
              >
                <span className="flex items-center gap-4">
                  <span className="w-5 font-accent text-[10px] font-semibold text-[#75babc]/75">
                    {choice.number}
                  </span>
                  <span className="font-accent text-sm font-semibold text-white/72 transition-colors group-hover:text-white sm:text-[15px]">
                    {choice.label}
                  </span>
                </span>
                <ArrowUpRight
                  className="size-3.5 text-white/28 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#75babc]"
                  aria-hidden
                />
              </Link>
            ))}
          </nav>
        </div>
      </div>

    </section>
  );
}
