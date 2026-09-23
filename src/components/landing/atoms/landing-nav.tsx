"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Mail,
  Workflow,
  ClipboardList,
  BarChart3,
  Users,
  Rocket,
  Building2,
  LayoutGrid,
  Gauge,
  HelpCircle,
  Newspaper,
  Eye,
  LogIn,
  AlignLeft,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLocale, LocaleToggle, type StringKey } from "@/components/landing/atoms/i18n";
import { LandingChat } from "@/components/landing/atoms/landing-chat";

// Cycled per letter so the wordmark mixes pixel faces, like the Atoms wordmark.
// Sparse faces (line, triangle) map to the outer letters and the dense ones
// (square, grid, circle) to the middle, so the centre of the word isn't hollow.
const NAV_PIXEL_FONTS = [
  "var(--font-pixel-line)",
  "var(--font-pixel-triangle)",
  "var(--font-pixel-square)",
  "var(--font-pixel-grid)",
  "var(--font-pixel-circle)",
] as const;

const NAV_LINKS = [
  { key: "product", label: "Kā tas darbojas", href: "#process" },
  { key: "clients", label: "Klienti", href: "#klienti" },
  { key: "help", label: "FAQ", href: "#faq" },
] as const;

const MEGA_MENUS = {
  product: {
    columns: [
      {
        label: "Produkts",
        links: [
          { label: "Kā Shadowy darbojas", href: "#process" },
          { label: "Darba fiksēšanas process", href: "#process" },
          { label: "Ko fiksēt", href: "#ko-fikset" },
          { label: "Pārskats", href: "#produkts" },
        ],
      },
      {
        label: "Komandai",
        links: [
          { label: "Galvenie ieguvumi", href: "#ieguvumi" },
          { label: "Kam Shadowy noder", href: "#kam-noder" },
          { label: "Pieteikt pilotu", href: "#pilots" },
        ],
      },
      {
        label: "Piekļuve",
        links: [
          { label: "Pieslēgties", href: "/login" },
          { label: "Izveidot kontu", href: "/register" },
          { label: "Privātuma politika", href: "/privacy" },
        ],
      },
    ],
    feature: {
      image: "/images/shadowy-dashboard-wide.png",
      title: "Viena vieta komandas darba analīzei",
      href: "#process",
      cta: "Apskatīt",
    },
  },
  clients: {
    columns: [
      {
        label: "Projekti",
        links: [
          { label: "PB Finanses", href: "/projekti/pb-finanses" },
          { label: "Visi pilotprojekti", href: "#klienti" },
          { label: "Klientu stāsti", href: "/projekti/pb-finanses" },
        ],
      },
      {
        label: "Uzņēmumiem",
        links: [
          { label: "Komandas slodze", href: "#ieguvumi" },
          { label: "Neredzamās izmaksas", href: "#ko-fikset" },
          { label: "Pieteikt savu pilotu", href: "#pilots" },
        ],
      },
      {
        label: "Sazināties",
        links: [
          { label: "Rakstīt e-pastu", href: "mailto:contact@shadowy.lv" },
          { label: "Shadowy LinkedIn", href: "https://www.linkedin.com/company/shadowy/" },
        ],
      },
    ],
    feature: {
      image: "/images/shadowyxpb.png",
      title: "Shadowy × PB Finanses",
      href: "/projekti/pb-finanses",
      cta: "Atvērt projektu",
    },
  },
  help: {
    columns: [
      {
        label: "Jautājumi",
        links: [
          { label: "Biežāk uzdotie jautājumi", href: "#faq" },
          { label: "Kas ir neredzamais darbs?", href: "#faq" },
          { label: "Vai Shadowy uzrauga darbiniekus?", href: "#faq" },
        ],
      },
      {
        label: "Sākt darbu",
        links: [
          { label: "Pieteikt pilotu", href: "#pilots" },
          { label: "Izveidot kontu", href: "/register" },
        ],
      },
      {
        label: "Atbalsts",
        links: [
          { label: "contact@shadowy.lv", href: "mailto:contact@shadowy.lv" },
          { label: "Pieslēgties", href: "/login" },
          { label: "Privātuma politika", href: "/privacy" },
        ],
      },
    ],
    feature: {
      image: "/images/shadowy_login.png",
      title: "Izrunāsim jūsu komandas situāciju",
      href: "#pilots",
      cta: "Pieteikties",
    },
  },
} as const;

type MegaMenuKey = keyof typeof MEGA_MENUS;

// One combined card set for the single "Izpēti" menu (like the reference's one
// "Services" trigger), 3×2 like the reference.
const MENU_CARDS: { tkey: StringKey; href: string; icon: LucideIcon }[] = [
  { tkey: "menu.howItWorks", href: "#process", icon: Workflow },
  { tkey: "menu.whatToLog", href: "#ko-fikset", icon: ClipboardList },
  { tkey: "menu.overview", href: "#produkts", icon: BarChart3 },
  { tkey: "menu.forWhom", href: "#kam-noder", icon: Users },
  { tkey: "menu.clients", href: "#klienti", icon: Building2 },
  { tkey: "menu.blog", href: "/blog", icon: Newspaper },
  { tkey: "menu.faq", href: "#faq", icon: HelpCircle },
];

// Compact card menu, like the atoms.technology dropdown: a small grid of
// icon + label cards instead of the wide columns panel.
const CARD_MENUS: Record<MegaMenuKey, { label: string; href: string; icon: LucideIcon }[]> = {
  product: [
    { label: "Kā tas darbojas", href: "#process", icon: Workflow },
    { label: "Ko fiksēt", href: "#ko-fikset", icon: ClipboardList },
    { label: "Pārskats", href: "#produkts", icon: BarChart3 },
    { label: "Kam noder", href: "#kam-noder", icon: Users },
    { label: "Pieteikt pilotu", href: "#pilots", icon: Rocket },
  ],
  clients: [
    { label: "PB Finanses", href: "/projekti/pb-finanses", icon: Building2 },
    { label: "Pilotprojekti", href: "#klienti", icon: LayoutGrid },
    { label: "Komandas slodze", href: "#ieguvumi", icon: Gauge },
    { label: "Pieteikt pilotu", href: "#pilots", icon: Rocket },
  ],
  help: [
    { label: "FAQ", href: "#faq", icon: HelpCircle },
    { label: "Neredzamais darbs", href: "#ko-fikset", icon: Eye },
    { label: "Pieteikt pilotu", href: "#pilots", icon: Rocket },
    { label: "Pieslēgties", href: "/login", icon: LogIn },
    { label: "Raksti mums", href: "mailto:contact@shadowy.lv", icon: Mail },
  ],
};

const WAVE_COLORS = [
  [91, 157, 83],
  [235, 70, 116],
  [61, 123, 242],
] as const;

function menuWaveColor(index: number, total: number) {
  const progress = total > 1 ? index / (total - 1) : 0;
  const segment = Math.min(Math.floor(progress * 2), 1);
  const localProgress = progress * 2 - segment;
  const from = WAVE_COLORS[segment];
  const to = WAVE_COLORS[segment + 1];
  const channel = (channelIndex: number) =>
    Math.round(
      from[channelIndex] +
        (to[channelIndex] - from[channelIndex]) * localProgress,
    );

  return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

function MegaMenuWaveText({ text }: { text: string }) {
  const letters = [...text];

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {letters.map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className="transition-colors [transition-duration:180ms] ease-out group-hover/link:text-[color:var(--mega-wave)] group-focus-visible/link:text-[color:var(--mega-wave)]"
            style={
              {
                "--mega-wave": menuWaveColor(index, letters.length),
                transitionDelay: `${index * 12}ms`,
              } as React.CSSProperties
            }
          >
            {letter}
          </span>
        ))}
      </span>
    </>
  );
}

function PixelMenuIcon({ open }: { open: boolean }) {
  // The reference draws the trigger as a 7x7 field of 3.5px cells at 20% and
  // lights individual cells to full white. Closed, the lit cell walks the grid
  // one at a time; open, the field resolves into a cross.
  const [lit, setLit] = React.useState(0);

  React.useEffect(() => {
    if (open) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(
      () => setLit((current) => (current + 1) % 49),
      110,
    );
    return () => window.clearInterval(timer);
  }, [open]);

  return (
    <span aria-hidden className="grid w-fit grid-cols-7 gap-px">
      {Array.from({ length: 49 }, (_, index) => {
        const row = Math.floor(index / 7);
        const column = index % 7;
        const isCross = row === column || row + column === 6;
        const isLit = open ? isCross : index === lit;

        return (
          <span
            key={index}
            className={cn(
              "size-[3.5px] rounded-sm bg-current transition-opacity duration-200",
              isLit ? "opacity-100" : "opacity-20",
            )}
          />
        );
      })}
    </span>
  );
}

/**
 * Full-width header that inverts with what is behind it.
 *
 * Over the dark hero it is transparent with white type and a white primary
 * pill; once the page scrolls onto the light sections it becomes a blurred
 * white bar with dark type and a black pill. Both states are the same bar - the
 * inversion is what keeps it readable without a solid slab over the video.
 */
export function LandingNav({
  alwaysLight = false,
}: {
  /**
   * Pin the bar to its light state. Pages without a full-height dark hero -
   * the case studies, for instance - have nothing for the transparent state to
   * sit on, so white type would land on a white page.
   */
  alwaysLight?: boolean;
} = {}) {
  const [onLight, setOnLight] = React.useState(alwaysLight);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = React.useState<MegaMenuKey | null>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelScheduledClose = React.useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const openMegaMenu = React.useCallback(
    (menu: MegaMenuKey) => {
      cancelScheduledClose();
      setActiveMegaMenu(menu);
    },
    [cancelScheduledClose],
  );

  const scheduleMegaMenuClose = React.useCallback(() => {
    cancelScheduledClose();
    closeTimer.current = setTimeout(() => setActiveMegaMenu(null), 180);
  }, [cancelScheduledClose]);

  React.useEffect(() => {
    if (alwaysLight) return;

    // The hero is one viewport tall, so the handover happens a little before
    // its bottom edge rather than at a fixed pixel offset.
    const onScroll = () => setOnLight(window.scrollY > window.innerHeight - 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [alwaysLight]);

  React.useEffect(() => {
    if (!menuOpen && !activeMegaMenu) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setActiveMegaMenu(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeMegaMenu, menuOpen]);

  React.useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  const navIsLight = alwaysLight || onLight;
  const { t } = useLocale();
  const [ctaOpen, setCtaOpen] = React.useState(false);

  // Every in-page anchor in this nav points at a landing section. Used on any
  // other route those ids do not exist, so the link would silently do nothing -
  // sending it back to the landing page is what makes the same nav work
  // unchanged on the case study pages.
  const pathname = usePathname();
  const resolveHref = React.useCallback(
    (href: string) =>
      href.startsWith("#") && pathname !== "/" ? `/${href}` : href,
    [pathname],
  );

  return (
    <>
      <AnimatePresence initial={false}>
        {activeMegaMenu && (
          <motion.button
            type="button"
            aria-label="Aizvērt izvēlni"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setActiveMegaMenu(null)}
            className="fixed inset-0 z-40 cursor-default bg-transparent"
          />
        )}
      </AnimatePresence>

    <header
      className={cn("fixed inset-x-0 top-0 px-3 pt-3 md:px-4 md:pt-4", menuOpen ? "z-[70]" : "z-50")}
      onMouseEnter={cancelScheduledClose}
      onMouseLeave={scheduleMegaMenuClose}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setActiveMegaMenu(null);
        }
      }}
    >
      {/* A translucent panel with no outline: the tint and the blur are what
          separate it from the footage behind, so a border would only draw a
          hard edge around something meant to read as a soft block. 4px matches
          the radius the cards and panels below use. */}
      <div
        className={cn(
          "relative mx-auto max-w-6xl overflow-hidden rounded-[4px] backdrop-blur-xl transition-colors duration-500 ease-out lg:overflow-visible",
          // The drop shadow is what lifts the bar off the page now that it has
          // no outline. Deeper over the dark hero, where a soft grey halo would
          // otherwise be invisible against near-black.
          navIsLight
            ? "bg-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.10)]"
            : "bg-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.30)]",
        )}
      >
      <div className="relative flex w-full items-center justify-between gap-6 px-4 py-2 md:px-6">
        {/* Left: logo + a single menu trigger, like the reference */}
        <div className="flex items-center gap-3 lg:gap-6">
        <Link
          href="/"
          aria-label="Shadowy sākumlapa"
          className="flex shrink-0 items-center gap-2.5"
          onMouseEnter={() => setActiveMegaMenu(null)}
          onFocus={() => setActiveMegaMenu(null)}
          onClick={() => {
            setMenuOpen(false);
            setActiveMegaMenu(null);
          }}
        >
          <Image
            src="/shadowy.svg"
            alt=""
            width={32}
            height={32}
            priority
            className={cn(
              "size-[22px] transition-[filter] duration-500 ease-out sm:size-6",
              navIsLight && "invert",
            )}
          />
          {/* Sized so the word stands as tall as the mark beside it. Both sizes
              are arbitrary values on purpose: Tailwind's named steps ship their
              own line-height, which lands after leading-none and would put the
              word's box back out of step with the mark. */}
          {/* Each letter in a different pixel face, like the Atoms wordmark. */}
          <span
            aria-label="Shadowy"
            className={cn(
              "text-[20px] leading-none tracking-tight transition-colors duration-500 ease-out sm:text-[22px]",
              navIsLight ? "text-black" : "text-white",
            )}
          >
            {[..."Shadowy"].map((letter, index) => (
              <span key={index} aria-hidden style={{ fontFamily: NAV_PIXEL_FONTS[index % NAV_PIXEL_FONTS.length] }}>
                {letter}
              </span>
            ))}
          </span>
        </Link>

        {/* Single menu trigger */}
        <div className="relative hidden lg:block">
          <button
            type="button"
            aria-expanded={activeMegaMenu !== null}
            aria-haspopup="true"
            onMouseEnter={() => openMegaMenu("product")}
            onFocus={() => openMegaMenu("product")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-extrabold tracking-tight transition-all duration-300 ease-out",
              activeMegaMenu !== null
                ? navIsLight
                  ? "bg-black/[0.06] text-black"
                  : "bg-white/[0.12] text-white"
                : navIsLight
                  ? "bg-transparent text-black/80 hover:bg-black/[0.035] hover:text-black"
                  : "bg-transparent text-white/85 hover:bg-white/[0.08] hover:text-white",
            )}
          >
            {t("nav.explore")}
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-300",
                activeMegaMenu !== null && "rotate-180",
              )}
              aria-hidden
            />
          </button>

          <AnimatePresence initial={false}>
            {activeMegaMenu !== null && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-0 top-[calc(100%+14px)] z-50 origin-top"
                onMouseEnter={cancelScheduledClose}
              >
                <div className="rounded-2xl border border-black/[0.06] bg-white p-2.5 shadow-[0_28px_70px_rgba(20,25,30,0.22)]">
                  <div className="grid grid-cols-[repeat(3,124px)] gap-2.5">
                    {MENU_CARDS.map((card) => {
                      const external = card.href.startsWith("http") || card.href.startsWith("mailto:");
                      const Icon = card.icon;
                      return (
                        <Link
                          key={card.tkey}
                          href={resolveHref(card.href)}
                          target={external ? "_blank" : undefined}
                          rel={external ? "noopener noreferrer" : undefined}
                          onClick={() => setActiveMegaMenu(null)}
                          className="group/link flex w-[124px] flex-col items-center justify-center gap-2.5 rounded-xl bg-black/[0.035] px-3 py-6 text-center text-black/80 transition-all duration-200 hover:-translate-y-0.5 hover:bg-black/[0.06]"
                        >
                          <Icon className="size-6 text-black/70" aria-hidden />
                          <span className="text-sm font-semibold leading-tight">
                            <MegaMenuWaveText text={t(card.tkey)} />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>

        {/* Centre: pill → opens the concierge chat */}
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          onMouseEnter={() => setActiveMegaMenu(null)}
          aria-haspopup="dialog"
          className={cn(
            "absolute left-1/2 top-1/2 hidden w-[clamp(320px,34vw,540px)] -translate-x-1/2 -translate-y-1/2 items-center justify-between gap-3 rounded-full py-2.5 pl-4 pr-2 text-sm transition-colors lg:flex",
            navIsLight
              ? "bg-black/[0.05] text-black/55 hover:bg-black/[0.08]"
              : "bg-white/[0.08] text-white/60 hover:bg-white/[0.12]",
          )}
        >
          <span className="flex min-w-0 items-center gap-3">
            <AlignLeft className="size-4 shrink-0 opacity-70" aria-hidden />
            <span className="truncate">{t("nav.pill")}</span>
          </span>
          <span
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
              navIsLight ? "bg-black/[0.07] text-black/70" : "bg-white/15 text-white/85",
            )}
          >
            {t("nav.pillChip")}
          </span>
        </button>

        <div
          className="flex shrink-0 items-center gap-2 sm:gap-2.5"
          onMouseEnter={() => setActiveMegaMenu(null)}
        >
          <div className="group relative hidden sm:block">
            <a
              href="mailto:contact@shadowy.lv"
              aria-label="Rakstīt uz contact@shadowy.lv"
              className={cn(
                "grid size-9 place-items-center rounded-full transition-colors",
                navIsLight
                  ? "text-black/60 hover:bg-black/5 hover:text-black"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              <Mail className="size-[18px]" aria-hidden />
            </a>
            {/* Tooltip on hover, like the reference */}
            <span
              role="tooltip"
              className={cn(
                "pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold opacity-0 shadow-lg transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100",
                navIsLight ? "bg-black text-white" : "bg-white text-black",
              )}
            >
              contact@shadowy.lv
            </span>
          </div>

          <Link
            href="/login"
            className={cn(
              "hidden rounded-full px-5 py-2 text-sm font-bold transition-colors sm:block",
              navIsLight
                ? "bg-black/[0.06] text-black hover:bg-black/[0.1]"
                : "bg-white/15 text-white hover:bg-white/25",
            )}
          >
            {t("nav.login")}
          </Link>

          {/* CTA that opens a small panel — contact + language + privacy.
              Hidden on mobile, where the hamburger already carries the same
              pixel-grid icon and the full menu. */}
          <div
            className="relative hidden lg:block"
            onMouseEnter={() => setCtaOpen(true)}
            onMouseLeave={() => setCtaOpen(false)}
          >
            <button
              type="button"
              aria-expanded={ctaOpen}
              aria-haspopup="true"
              aria-label={t("nav.cta")}
              className={cn(
                "grid size-9 place-items-center transition-colors",
                navIsLight
                  ? ctaOpen ? "text-black" : "text-black/70 hover:text-black"
                  : ctaOpen ? "text-white" : "text-white/70 hover:text-white",
              )}
            >
              <PixelMenuIcon open={ctaOpen} />
            </button>

            <AnimatePresence initial={false}>
              {ctaOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 top-[calc(100%+12px)] z-50 w-[290px] origin-top-right rounded-2xl border border-black/[0.06] bg-white p-2.5 text-black shadow-[0_28px_70px_rgba(20,25,30,0.22)]"
                >
                  <div className="flex items-center gap-3 px-2 py-2">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-black text-white">
                      <Rocket className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-bold">{t("cta.title")}</div>
                      <div className="text-xs text-black/50">{t("cta.subtitle")}</div>
                    </div>
                  </div>

                  <Link
                    href={resolveHref("#pilots")}
                    onClick={() => setCtaOpen(false)}
                    className="mt-1 block rounded-xl bg-black py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-black/85"
                  >
                    {t("nav.cta")}
                  </Link>

                  <a
                    href="mailto:contact@shadowy.lv"
                    className="mt-1.5 flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-black/80 transition-colors hover:bg-black/[0.04]"
                  >
                    <Mail className="size-4 text-black/50" aria-hidden />
                    contact@shadowy.lv
                  </a>

                  <div className="my-1.5 h-px bg-black/[0.07]" />

                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-sm font-semibold">{t("cta.language")}</span>
                    <LocaleToggle light />
                  </div>

                  <Link
                    href="/privacy"
                    onClick={() => setCtaOpen(false)}
                    className="block rounded-lg px-2 py-2 text-sm text-black/50 transition-colors hover:bg-black/[0.04] hover:text-black/80"
                  >
                    {t("cta.privacy")}
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-nav"
            aria-label={menuOpen ? "Aizvērt izvēlni" : "Atvērt izvēlni"}
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-full transition-colors sm:size-9 lg:hidden",
              navIsLight
                ? "text-black hover:bg-black/5"
                : "text-white hover:bg-white/10",
            )}
          >
            <PixelMenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      </div>
    </header>

      <AnimatePresence initial={false}>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Aizvērt izvēlni"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(14px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[55] bg-black/25 lg:hidden"
            />

            <motion.div
              id="landing-mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="Mobilā navigācija"
              // A compact card dropping from the top-right corner, under the
              // pixel icon — the atoms.technology mobile menu, not a full sheet.
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              style={{ transformOrigin: "top right" }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-3 top-[72px] z-[60] flex max-h-[calc(100dvh-5.5rem)] w-[300px] max-w-[calc(100vw-1.5rem)] flex-col overflow-y-auto rounded-[22px] bg-white p-2.5 text-black shadow-[0_30px_100px_rgba(0,0,0,0.28)] lg:hidden"
            >
              {/* Header: who answers, how fast */}
              <div className="flex items-center gap-3 px-2 py-2">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-black text-white">
                  <Rocket className="size-[18px]" aria-hidden />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-bold">{t("cta.title")}</div>
                  <div className="text-xs text-black/50">{t("cta.subtitle")}</div>
                </div>
              </div>

              <Link
                href={resolveHref("#pilots")}
                onClick={() => setMenuOpen(false)}
                className="mt-1 block rounded-xl bg-black py-3 text-center text-sm font-bold text-white transition-colors hover:bg-black/85"
              >
                {t("nav.cta")}
              </Link>

              {/* Icon rows — the same six cards as the desktop "Izpēti" menu */}
              <nav className="mt-1.5 flex flex-col" aria-label="Mobilā navigācija">
                {MENU_CARDS.map((card) => {
                  const Icon = card.icon;
                  return (
                    <Link
                      key={card.tkey}
                      href={resolveHref(card.href)}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-[15px] font-semibold text-black/85 transition-colors hover:bg-black/[0.04]"
                    >
                      <Icon className="size-[18px] shrink-0 text-black/55" aria-hidden />
                      {t(card.tkey)}
                    </Link>
                  );
                })}
                <a
                  href="mailto:contact@shadowy.lv"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-[15px] font-semibold text-black/85 transition-colors hover:bg-black/[0.04]"
                >
                  <Mail className="size-[18px] shrink-0 text-black/55" aria-hidden />
                  {t("nav.email")}
                </a>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-[15px] font-semibold text-black/85 transition-colors hover:bg-black/[0.04]"
                >
                  <LogIn className="size-[18px] shrink-0 text-black/55" aria-hidden />
                  {t("nav.login")}
                </Link>
              </nav>

              <div className="my-1.5 h-px bg-black/[0.07]" />

              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-sm font-semibold">{t("cta.language")}</span>
                <LocaleToggle light />
              </div>

              <Link
                href="/privacy"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-2 py-2 text-sm text-black/50 transition-colors hover:bg-black/[0.04] hover:text-black/80"
              >
                {t("cta.privacy")}
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LandingChat open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
