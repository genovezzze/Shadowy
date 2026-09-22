"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Linkedin, Mail } from "lucide-react";
import { HoverWaveText } from "@/components/landing/atoms/hover-wave-text";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale, type Locale } from "@/components/landing/atoms/i18n";

type Tone = "dark" | "light";

/** Pill that labels a footer column, matching the reference's capsules. */
function ColumnHeading({ children, tone }: { children: string; tone: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold tracking-tight",
        tone === "dark"
          ? "bg-white text-black"
          : "bg-black/[0.055] text-black",
      )}
    >
      {children}
    </span>
  );
}

type L = Record<Locale, string>;

const FOOTER_COLUMNS: readonly {
  heading: L;
  links: readonly { label: L; href: string }[];
}[] = [
  {
    heading: { lv: "Produkts", en: "Product" },
    links: [
      { label: { lv: "Kā tas darbojas", en: "How it works" }, href: "#process" },
      { label: { lv: "Process", en: "Process" }, href: "#process" },
      { label: { lv: "Ko fiksēt", en: "What to log" }, href: "#ko-fikset" },
      { label: { lv: "Pārskats", en: "Overview" }, href: "#produkts" },
      { label: { lv: "Kam noder", en: "Who it's for" }, href: "#kam-noder" },
    ],
  },
  {
    heading: { lv: "Uzņēmumam", en: "For companies" },
    links: [
      { label: { lv: "Ieguvumi", en: "Benefits" }, href: "#ieguvumi" },
      { label: { lv: "Klienti", en: "Clients" }, href: "#klienti" },
      { label: { lv: "FAQ", en: "FAQ" }, href: "#faq" },
      { label: { lv: "Pieteikties pilotam", en: "Apply for a pilot" }, href: "#pilots" },
    ],
  },
  {
    heading: { lv: "Konts", en: "Account" },
    links: [
      { label: { lv: "Ieiet", en: "Log in" }, href: "/login" },
      { label: { lv: "Privātuma politika", en: "Privacy policy" }, href: "/privacy" },
    ],
  },
];

/**
 * `tone` flips the whole footer between the landing's black and the white used
 * on the case study pages. The light version uses the same hills with their
 * black sky removed, preserving the landing layout without a dark rectangle.
 */
export function LandingFooter({ tone = "dark" }: { tone?: Tone } = {}) {
  const isDark = tone === "dark";
  const { locale, t } = useLocale();

  // The columns point at landing sections; off that route those ids do not
  // exist, so the links have to travel back to the landing page first.
  const pathname = usePathname();
  const resolveHref = (href: string) =>
    href.startsWith("#") && pathname !== "/" ? `/${href}` : href;

  return (
    <footer
      className={cn(
        "relative overflow-hidden border-t",
        // Bottom padding matched to the hills band below (360px, 520px from md),
        // not the 16rem/20rem it used to be. Those were shorter than the
        // illustration, so the closing rule and the copyright line came to rest
        // on the grass instead of clearing it - the content now stops where the
        // hills begin.
        isDark
          ? "border-white/10 bg-black pb-14 pt-14 sm:pt-16 md:pb-20 md:pt-20"
          : "border-black/10 bg-white pb-14 pt-14 sm:pt-16 md:pb-20 md:pt-20",
      )}
    >
      <div className="relative z-10 w-full px-4 md:px-8">
        {/* Brand on one side, the two calls to action on the other - the same
            top row the reference opens its footer with. */}
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/shadowy.svg"
              alt=""
              width={30}
              height={30}
              className={cn("size-[30px]", !isDark && "invert")}
            />
            <span
              className={cn(
                "font-display text-2xl font-bold tracking-tight",
                isDark ? "text-white" : "text-black",
              )}
            >
              Shadowy
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={resolveHref("#pilots")}
              className={cn(
                "rounded-full px-6 py-2.5 text-sm font-bold transition-colors",
                isDark
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-black text-white hover:bg-black/85",
              )}
            >
              {t("nav.cta")}
            </Link>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading.lv}>
              <ColumnHeading tone={tone}>{column.heading[locale]}</ColumnHeading>
              <ul className="mt-6 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label.lv}>
                    <Link
                      href={resolveHref(link.href)}
                      className={cn(
                        "group inline-block text-[15px] font-bold tracking-tight",
                        isDark ? "text-white" : "text-black",
                      )}
                    >
                      <HoverWaveText text={link.label[locale]} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <ColumnHeading tone={tone}>{t("footer.contacts")}</ColumnHeading>
            <ul className="mt-6 space-y-3">
              <li>
                <a
                  href="mailto:contact@shadowy.lv"
                  className={cn("group inline-flex max-w-full items-center gap-2 break-all text-[15px] font-bold tracking-tight", isDark ? "text-white" : "text-black")}
                >
                  <Mail className="size-4 shrink-0" aria-hidden />
                  <HoverWaveText text="contact@shadowy.lv" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/shadowy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn("group inline-flex items-center gap-2 text-[15px] font-bold tracking-tight", isDark ? "text-white" : "text-black")}
                >
                  <Linkedin className="size-4 shrink-0" aria-hidden />
                  <HoverWaveText text="LinkedIn" />
                  <ArrowUpRight className={cn("size-3.5 shrink-0", isDark ? "text-white/50" : "text-black/40")} aria-hidden />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          className={cn(
            "mt-14 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between",
            isDark ? "border-white/10" : "border-black/10",
          )}
        >
          <p className={cn("text-xs", isDark ? "text-white/35" : "text-black/40")}>
            &copy; {new Date().getFullYear()} Shadowy
          </p>
          <Link
            href="/privacy"
            className={cn(
              "text-xs transition-colors",
              isDark
                ? "text-white/35 hover:text-white/70"
                : "text-black/40 hover:text-black/70",
            )}
          >
            {t("cta.privacy")}
          </Link>
        </div>
      </div>
      <div aria-hidden className="relative z-10 mt-10 h-[220px] w-full sm:hidden">
        <Image
          src={isDark ? "/images/pic8.webp" : "/images/pic8-cutout.png"}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-bottom"
        />
      </div>
    </footer>
  );
}
