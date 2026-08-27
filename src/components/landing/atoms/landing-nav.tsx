"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronRight, Mail } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
            className="transition-colors duration-[180ms] ease-out group-hover/link:text-[color:var(--mega-wave)] group-focus-visible/link:text-[color:var(--mega-wave)]"
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

  const megaMenu = activeMegaMenu ? MEGA_MENUS[activeMegaMenu] : null;
  const navIsLight = alwaysLight || onLight || activeMegaMenu !== null || menuOpen;

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
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setActiveMegaMenu(null)}
            className="fixed inset-0 z-40 cursor-default bg-black/15"
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
          menuOpen
            // Matches the radius of the menu card that drops out from under it,
            // so the bar and the card read as one panel.
            ? "rounded-b-none rounded-t-[22px] bg-white shadow-none"
            : activeMegaMenu
            ? "rounded-b-none rounded-t-[4px] bg-white shadow-none"
            : navIsLight
              ? "bg-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.10)]"
            : "bg-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.30)]",
        )}
      >
      <div className="flex w-full items-center justify-between gap-6 px-4 py-2 md:px-6">
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
          <span
            className={cn(
              "font-display text-[22px] font-semibold leading-none tracking-tight transition-colors duration-500 ease-out sm:text-[24px]",
              navIsLight ? "text-black" : "text-white",
            )}
          >
            Shadowy
          </span>
        </Link>

        <nav
          className="hidden items-center gap-8 lg:flex"
          aria-label="Galvenā navigācija"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={resolveHref(link.href)}
              aria-expanded={activeMegaMenu === link.key}
              aria-haspopup="true"
              aria-controls="landing-mega-menu"
              onMouseEnter={() => openMegaMenu(link.key)}
              onFocus={() => openMegaMenu(link.key)}
              onClick={() => setActiveMegaMenu(null)}
              className={cn(
                "rounded-full px-5 py-2.5 text-sm font-extrabold tracking-tight transition-all duration-[400ms] ease-out",
                activeMegaMenu === link.key
                  ? "bg-[#f1f1f1] text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                  : navIsLight
                    ? "bg-transparent text-black/80 hover:bg-black/[0.035] hover:text-black"
                    : "bg-transparent text-white/85 hover:bg-white/[0.08] hover:text-white",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div
          className="flex shrink-0 items-center gap-2 sm:gap-2.5"
          onMouseEnter={() => setActiveMegaMenu(null)}
        >
          <a
            href="mailto:contact@shadowy.lv"
            aria-label="Rakstīt uz contact@shadowy.lv"
            className={cn(
              "hidden size-9 place-items-center rounded-full transition-colors sm:grid",
              navIsLight
                ? "text-black/60 hover:bg-black/5 hover:text-black"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            <Mail className="size-[18px]" aria-hidden />
          </a>

          <Link
            href="/login"
            className={cn(
              "hidden rounded-full px-5 py-2 text-sm font-bold transition-colors sm:block",
              navIsLight
                ? "bg-black/[0.06] text-black hover:bg-black/[0.1]"
                : "bg-white/15 text-white hover:bg-white/25",
            )}
          >
            Pieslēgties
          </Link>

          <Link
            href={resolveHref("#pilots")}
            className={cn(
              "rounded-full px-4 py-1.5 text-[13px] font-bold transition-all active:scale-95 sm:px-5 sm:py-2 sm:text-sm",
              navIsLight
                ? "bg-black text-white hover:bg-black/85"
                : "bg-white text-black hover:bg-white/90",
            )}
          >
            Pieteikt pilotu
          </Link>

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

      <AnimatePresence initial={false}>
        {megaMenu && (
          <motion.div
            id="landing-mega-menu"
            initial={{
              opacity: 0,
              y: -12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -8,
            }}
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 top-[calc(100%-1px)] hidden origin-top overflow-visible rounded-b-[4px] bg-white text-black shadow-[0_28px_70px_rgba(0,0,0,0.16)] lg:grid lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]"
            onMouseEnter={cancelScheduledClose}
          >
            <motion.div
              key={`mega-columns-${activeMegaMenu}`}
              initial={{ opacity: 0.86, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-3 gap-10 px-8 py-9 xl:gap-14 xl:px-12 xl:py-11"
            >
            {megaMenu.columns.map((column) => (
              <section key={column.label}>
                <span className="inline-flex rounded-full bg-[#f1f1f1] px-4 py-2 text-sm font-extrabold leading-none text-black">
                  {column.label}
                </span>
                <ul className="mt-7 space-y-4">
                  {column.links.map((link) => {
                    const external = link.href.startsWith("http");

                    return (
                      <li key={`${column.label}-${link.label}`}>
                        <Link
                          href={resolveHref(link.href)}
                          target={external ? "_blank" : undefined}
                          rel={external ? "noopener noreferrer" : undefined}
                          onClick={() => setActiveMegaMenu(null)}
                          className="group/link inline-flex items-center gap-2 text-[15px] font-extrabold tracking-tight text-black/88 transition-colors duration-200 hover:text-[#1f7775]"
                        >
                          <MegaMenuWaveText text={link.label} />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}

            <Link
              href={resolveHref("#pilots")}
              onClick={() => setActiveMegaMenu(null)}
              className="group/partner col-span-3 mt-2 flex items-center justify-between rounded-[18px] bg-black/[0.055] px-6 py-5 text-base font-extrabold transition-colors duration-500 hover:bg-black/[0.085]"
            >
              <span>Pieteikt Shadowy pilotu savai komandai</span>
            </Link>
            </motion.div>

            <motion.aside
              key={`mega-feature-${activeMegaMenu}`}
              initial={{ opacity: 0.86, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.66, ease: [0.22, 1, 0.36, 1] }}
              className="border-l border-black/[0.07] p-6 xl:p-8"
            >
            <Link
              href={resolveHref(megaMenu.feature.href)}
              onClick={() => setActiveMegaMenu(null)}
              className="group/feature flex h-full min-h-[340px] flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-black">
                <Image
                  src={megaMenu.feature.image}
                  alt=""
                  fill
                  sizes="360px"
                  className="object-cover transition-transform duration-1000 ease-out group-hover/feature:scale-[1.04]"
                />
              </div>
              <h3 className="mt-5 text-balance font-display text-2xl font-bold leading-tight tracking-[-0.025em]">
                {megaMenu.feature.title}
              </h3>
              <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white transition-transform duration-500 group-hover/feature:-translate-y-0.5">
                {megaMenu.feature.cta}
              </span>
            </Link>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

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
              // Grown from the top rather than clipped: a rounded clip-path cut
              // its own corners out of the white, which showed as dark nicks
              // where the card meets the bar above it.
              initial={{ opacity: 0, scaleY: 0.92 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0.96 }}
              style={{ transformOrigin: "top center" }}
              transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
              // A card that hugs its content rather than a full-height sheet:
              // the header bar above it is white while the menu is open, so the
              // two read as one panel dropped from the top, and the page stays
              // visible under it.
              className="fixed inset-x-3 top-3 z-[60] flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-y-auto rounded-b-[22px] rounded-t-[22px] bg-white px-4 pb-5 pt-[58px] md:px-6 text-black shadow-[0_30px_100px_rgba(0,0,0,0.28)] lg:hidden"
            >
              <motion.nav
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { delayChildren: 0.14, staggerChildren: 0.06 } },
                }}
                className="flex flex-col"
                aria-label="Mobilā navigācija"
              >
                {[
                  ...NAV_LINKS.map((link) => ({ ...link, submenu: true })),
                  { label: "Pilotprojekts", href: "/pilotprojekts", submenu: false },
                  { label: "Pieslēgties", href: "/login", submenu: false },
                ].map((link) => (
                  <motion.div
                    key={link.href}
                    variants={{
                      hidden: { opacity: 0, x: 18 },
                      visible: { opacity: 1, x: 0, transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] } },
                    }}
                  >
                    <Link
                      href={resolveHref(link.href)}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between border-b border-black/[0.08] py-[18px] text-[20px] font-bold tracking-[-0.025em] text-black"
                    >
                      {link.label}
                      {/* Only the entries that open something else carry the
                          chevron, the way the reference marks its two submenu
                          rows and leaves the plain links bare. */}
                      {link.submenu && (
                        <ChevronRight className="size-5 text-black/25" strokeWidth={1.5} aria-hidden />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="grid gap-3 pt-5"
              >
                <a
                  href="mailto:contact@shadowy.lv"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-black/[0.055] px-4 text-[15px] font-bold text-black"
                >
                  <Mail className="size-[18px] text-black/60" aria-hidden />
                  E-pasts
                </a>
                <Link
                  href={resolveHref("#pilots")}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-[56px] items-center justify-center rounded-full bg-black px-6 text-base font-bold text-white"
                >
                  Pieteikt pilotu
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
