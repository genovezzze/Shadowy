import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd, breadcrumbNode, organizationNode } from "@/lib/structured-data";
import { LandingNav } from "@/components/landing/atoms/landing-nav";
import { LandingFooter } from "@/components/landing/atoms/landing-footer";
import { ARTICLES, AUTHOR, type Article } from "@/content/blog";

const title = "Raksti par neredzamo darbu un komandas slodzi";
const description =
  "Praktiski raksti par neredzamo darbu, komandas slodzes pārskatu un klientu rentabilitāti pakalpojumu uzņēmumiem.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    locale: "lv_LV",
    url: "/blog",
    siteName: "Shadowy",
    title: `${title} | Shadowy`,
    description,
    images: [{ url: "/images/shadowy-dashboard-wide.png", width: 1916, height: 821, alt: "Shadowy" }],
  },
};

const LV_MONTHS = ["janvāris", "februāris", "marts", "aprīlis", "maijs", "jūnijs", "jūlijs", "augusts", "septembris", "oktobris", "novembris", "decembris"];

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCDate()}. ${LV_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Renders the article's cover image, or the first frame of its video. */
function Media({ article, sizes, fit = "cover" }: { article: Article; sizes: string; fit?: "cover" | "contain" }) {
  const object = fit === "contain" ? "object-contain" : "object-cover";
  if (article.cover) {
    return (
      <Image
        src={article.cover}
        alt={article.coverAlt ?? article.title}
        fill
        sizes={sizes}
        className={`${object} transition-transform duration-500 group-hover:scale-[1.02]`}
      />
    );
  }
  if (article.video) {
    return (
      <video
        src={article.video}
        muted
        playsInline
        preload="metadata"
        aria-hidden
        className={`size-full ${object}`}
      />
    );
  }
  return null;
}

function Byline({ date, readingMinutes }: { date: string; readingMinutes: number }) {
  return (
    <div className="flex items-center gap-2.5 text-[13px] text-black/50">
      <span className="grid size-6 shrink-0 place-items-center overflow-hidden rounded-full bg-black">
        <Image src={AUTHOR.avatar} alt="" width={14} height={14} />
      </span>
      <span className="font-medium text-black/70">{AUTHOR.name}</span>
      <span aria-hidden>·</span>
      <time dateTime={date}>{formatDate(date)}</time>
      <span aria-hidden className="hidden sm:inline">·</span>
      <span className="hidden sm:inline">{readingMinutes} min</span>
    </div>
  );
}

export default function BlogIndexPage() {
  const sorted = [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
  const [featured, ...rest] = sorted;
  const featuredHasMedia = Boolean(featured?.cover || featured?.video);

  return (
    <div className="min-h-screen bg-white font-sans text-black antialiased">
      <JsonLd nodes={[organizationNode, breadcrumbNode([{ name: "Raksti", path: "/blog" }])]} />
      <LandingNav alwaysLight />

      <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-28 md:px-8 md:pt-40">
        <header className="mb-12 md:mb-14">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Raksti</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-black/55 md:text-base">{description}</p>
        </header>

        {/* Featured latest post */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group block border-b border-black/10 pb-12">
            {featuredHasMedia && (
              <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-black">
                <Media article={featured} sizes="(min-width: 768px) 48rem, 100vw" fit="contain" />
              </div>
            )}
            <h2 className="text-2xl font-bold leading-tight tracking-tight transition-colors group-hover:text-black/60 md:text-[32px]">
              {featured.title}
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-black/60 md:text-base">
              {featured.description}
            </p>
            <div className="mt-5">
              <Byline date={featured.date} readingMinutes={featured.readingMinutes} />
            </div>
          </Link>
        )}

        {/* The rest, as a list with thumbnails where available */}
        <ul className="flex flex-col divide-y divide-black/10">
          {rest.map((a: Article) => {
            const hasMedia = Boolean(a.cover || a.video);
            return (
              <li key={a.slug}>
                <Link href={`/blog/${a.slug}`} className="group flex flex-col gap-4 py-8 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div className="min-w-0 flex-1 order-2 sm:order-1">
                    <h2 className="text-xl font-bold leading-tight tracking-tight transition-colors group-hover:text-black/60 md:text-2xl">
                      {a.title}
                    </h2>
                    <p className="mt-2.5 text-sm leading-relaxed text-black/55 md:text-[15px]">
                      {a.description}
                    </p>
                    <div className="mt-4">
                      <Byline date={a.date} readingMinutes={a.readingMinutes} />
                    </div>
                  </div>
                  {hasMedia && (
                    <div className="relative order-1 aspect-[16/9] w-full shrink-0 overflow-hidden rounded-xl bg-black sm:order-2 sm:mt-1 sm:w-44">
                      <Media article={a} sizes="(min-width: 640px) 11rem, 100vw" fit="contain" />
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </main>

      <LandingFooter tone="light" />
    </div>
  );
}
