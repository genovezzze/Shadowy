"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal, SectionBadge } from "@/components/landing/atoms/landing-primitives";
import { WaveHeading } from "@/components/landing/atoms/wave-heading";
import { useLocale, type Locale } from "@/components/landing/atoms/i18n";

/**
 * The product itself, on screen.
 *
 * Until this section the page described the outcome without ever showing it -
 * the only screenshot on the site was the Open Graph image, which a visitor
 * never sees. A B2B buyer decides partly on whether the thing looks real, so
 * the product is shown in the flow rather than saved for the case study.
 *
 * Laid out as the atoms.technology case grid: image, bold title, muted line
 * under it, two to a row. One wide shot carrying two different screens at once
 * made the reader do the separating; a card each lets the caption say what its
 * own screen is for.
 *
 * Sits on paper between the approach and the outcomes, so the page keeps its
 * dark - light - dark rhythm and this reads as the payoff of the process
 * described directly above it.
 */
type ProductView = {
  title: Record<Locale, string>;
  text: Record<Locale, string>;
  src: string;
  width: number;
  height: number;
  alt: string;
};

const VIEWS: readonly ProductView[] = [
  {
    title: { lv: "Ieraksts savā valodā", en: "An entry in your own words" },
    text: {
      lv: "Darbinieks pastāsta vai ieraksta situāciju tā, kā tā bija. Shadowy sagatavo melnrakstu, ko viņš pats pārskata un apstiprina - nekas netiek saglabāts bez viņa",
      en: "The employee tells or types the situation as it was. Shadowy prepares a draft they review and approve themselves - nothing is saved without them",
    },
    src: "/images/Shadowy-Beige-Laptop.svg",
    width: 1920,
    height: 1080,
    alt: "Shadowy AI ieraksta ekrāns klēpjdatorā: lauks, kurā darbinieks apraksta, kas aizņēma papildu laiku",
  },
  {
    title: { lv: "Kategorijas pret klientiem", en: "Categories against clients" },
    text: {
      lv: "Viens režģis, kurā redzams, kurš klients dod visvairāk katras kategorijas darba - stundas pa kategorijām un klientiem blakus",
      en: "One grid that shows which client generates the most work in each category - hours by category and client side by side",
    },
    src: "/images/shadowy-tablet-matrix-purple.svg",
    width: 1920,
    height: 1080,
    alt: "Shadowy režģis kategorija pret klientu uz planšetes: stundas katrā kategorijā pa klientiem",
  },
  {
    title: { lv: "Atskaite, kas gatava izdrukai", en: "A report ready to print" },
    text: {
      lv: "Mēneša pārskats pa klientiem, ko var eksportēt vai izdrukāt un likt uz galda sarunā par cenu - bez atsevišķas datu sagatavošanas",
      en: "A monthly per-client overview you can export or print and put on the table in a pricing conversation - with no separate data prep",
    },
    src: "/images/Shadowy-Paper-Flowers.svg",
    width: 1920,
    height: 1080,
    alt: "Shadowy klienta izmaksu atskaite, izdrukāta uz papīra",
  },
  {
    title: { lv: "Ieteikumi, ko labot vispirms", en: "Suggestions on what to fix first" },
    text: {
      lv: "Atkārtotais darbs pats sakārtojas procesos: redzat, uz kurām kategorijām tas attiecas, cik stundu labojums var atbrīvot un kuri klienti prasa visvairāk laika",
      en: "Repeated work organises itself into processes: you see which categories it touches, how many hours a fix could free up and which clients take the most time",
    },
    src: "/images/Shadowy-Orange-Laptop.svg",
    width: 1920,
    height: 1080,
    alt: "Shadowy procesu analīze: ieteikums samazināt atkārtotu saskaņošanu, iespējamais laika ietaupījums un klientu slodze",
  },
];

export function LandingProduct() {
  const { locale, t } = useLocale();
  return (
    <section
      id="produkts"
      // No top padding: the section above is the same paper colour and already ends
      // on its own py-24/py-32, so stacking a second one opened a screen-high
      // band of empty white with no colour change to justify it.
      className="relative scroll-mt-20 overflow-hidden bg-[var(--landing-paper)] pb-16 pt-16 md:pb-32 md:pt-32"
    >
      <div className="relative z-10 w-full px-4 md:px-8">
        <Reveal as="header" className="mb-8 max-w-3xl md:mb-14">
          <div className="mb-3 inline-block">
            <SectionBadge>{t("product.badge")}</SectionBadge>
          </div>
          <h2 className="text-landing-h2 text-black">
            <WaveHeading tone="dark">{t("product.heading")}</WaveHeading>
          </h2>
        </Reveal>

        {/* Two per row, filling to a 2x2 once the fourth visual lands. Kept at
            two rather than fitting the current three across, so the images stay
            large enough to read the screen inside each mockup. */}
        <div className="grid gap-8 md:grid-cols-2 md:gap-10">
          {VIEWS.map((view, index) => (
            <Reveal key={view.title.lv} delay={0.05 * index}>
              <figure className="group">
                {/* One 16:9 frame for both cards. Both visuals are drawn on the
                    same 1672 x 940.5 viewBox, so each fills it exactly: the two
                    images come out the same size, the titles line up, and there
                    is no letterboxing on either side. `contain` rather than
                    `cover` so that a future visual in a different shape shows
                    whole instead of being silently cropped. */}
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
                  <Image
                    src={view.src}
                    alt={view.alt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    // SVG never goes through the image optimiser: Next refuses
                    // it unless `dangerouslyAllowSVG` is on site-wide, and a
                    // vector has nothing to gain from resizing anyway.
                    unoptimized={view.src.endsWith(".svg")}
                    // Grows into its own frame on hover, which the rounded
                    // corners clip - the same slow push the project cards use,
                    // so the two grids answer the pointer the same way. Held to
                    // 4%: the visual is a mockup with a device in it, and more
                    // than that starts cutting the screen off at the edges.
                    className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
                <figcaption>
                  <h3 className="mt-5 text-xl font-bold leading-tight tracking-tight text-black md:text-2xl">
                    <WaveHeading tone="dark">{view.title[locale]}</WaveHeading>
                  </h3>
                  <p className="mt-2.5 max-w-xl text-sm font-semibold leading-relaxed md:text-base">
                    <WaveHeading tone="dark" settledColor="rgba(0,0,0,0.5)">{view.text[locale]}</WaveHeading>
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-8 text-xs font-medium leading-relaxed text-black/45">
            {t("product.demoNote")}
          </p>
          <Link
            href="/projekti/pb-finanses"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-black/85 active:scale-[0.98]"
          >
            {t("product.cta")}
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
