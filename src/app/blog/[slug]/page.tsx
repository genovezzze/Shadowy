import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Linkedin } from "lucide-react";
import { JsonLd, breadcrumbNode, organizationNode } from "@/lib/structured-data";
import { getSiteUrl } from "@/lib/site-url";
import { LandingNav } from "@/components/landing/atoms/landing-nav";
import { LandingFooter } from "@/components/landing/atoms/landing-footer";
import { ARTICLES, AUTHOR, getArticle } from "@/content/blog";

const siteUrl = getSiteUrl();

const LV_MONTHS = ["janvāris", "februāris", "marts", "aprīlis", "maijs", "jūnijs", "jūlijs", "augusts", "septembris", "oktobris", "novembris", "decembris"];

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCDate()}. ${LV_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = getArticle(params.slug);
  if (!article) return {};
  const ogImage = article.cover
    ? { url: article.cover, alt: article.coverAlt ?? article.title }
    : { url: "/images/shadowy-dashboard-wide.png", width: 1916, height: 821, alt: "Shadowy" };
  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      type: "article",
      locale: "lv_LV",
      url: `/blog/${article.slug}`,
      siteName: "Shadowy",
      title: `${article.title} | Shadowy`,
      description: article.description,
      publishedTime: article.date,
      images: [ogImage],
    },
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug);
  if (!article) notFound();
  const { title, description, date, readingMinutes, keywords, cover, coverAlt, video, sourceUrl, sourceLabel, Body } = article;

  const blogPostingNode = {
    "@type": "BlogPosting",
    "@id": `${siteUrl}/blog/${article.slug}#article`,
    headline: title,
    description,
    inLanguage: "lv",
    datePublished: date,
    dateModified: date,
    keywords: keywords.join(", "),
    mainEntityOfPage: `${siteUrl}/blog/${article.slug}`,
    image: `${siteUrl}/images/shadowy-dashboard-wide.png`,
    author: { "@id": `${siteUrl}/#organization` },
    publisher: { "@id": `${siteUrl}/#organization` },
  } as const;

  return (
    <div className="min-h-screen bg-white font-sans text-black antialiased">
      <JsonLd
        nodes={[
          organizationNode,
          blogPostingNode,
          breadcrumbNode([
            { name: "Raksti", path: "/blog" },
            { name: title, path: `/blog/${article.slug}` },
          ]),
        ]}
      />
      <LandingNav alwaysLight />

      <main className="mx-auto w-full max-w-2xl px-4 pb-24 pt-28 md:px-8 md:pt-40">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-black/55 transition-colors hover:text-black">
          <ArrowLeft className="size-4" aria-hidden />
          Visi raksti
        </Link>

        <article className="mt-8">
          <h1 className="text-3xl font-bold leading-[1.1] tracking-tight md:text-[42px]">{title}</h1>
          <p className="mt-4 text-base leading-relaxed text-black/60 md:text-lg">{description}</p>

          <div className="mt-6 flex items-center gap-2.5 text-[13px] text-black/50">
            <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-black">
              <Image src={AUTHOR.avatar} alt="" width={16} height={16} />
            </span>
            <span className="font-medium text-black/70">{AUTHOR.name}</span>
            <span aria-hidden>·</span>
            <time dateTime={date}>{formatDate(date)}</time>
            <span aria-hidden>·</span>
            <span>{readingMinutes} min lasīšana</span>
          </div>

          {video ? (
            <div className="mt-8 overflow-hidden rounded-2xl bg-black">
              <video
                src={video}
                controls
                muted
                playsInline
                preload="metadata"
                className="aspect-video w-full"
              />
            </div>
          ) : cover ? (
            <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-2xl bg-black">
              <Image
                src={cover}
                alt={coverAlt ?? title}
                fill
                priority
                sizes="(min-width: 768px) 42rem, 100vw"
                className="object-contain"
              />
            </div>
          ) : null}

          <hr className="my-8 border-black/10" />

          <Body />

          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-black/60 underline-offset-4 transition-colors hover:text-black hover:underline"
            >
              <Linkedin className="size-4" aria-hidden />
              {sourceLabel ?? "Skatīt oriģinālu"}
            </a>
          )}
        </article>

        <div className="mt-14 rounded-2xl border border-black/[0.06] bg-[#fafafa] p-6 md:p-8">
          <h2 className="text-xl font-bold tracking-tight">Gribat to ieraudzīt savā komandā?</h2>
          <p className="mt-2 text-sm leading-relaxed text-black/60 md:text-base">
            30 dienu pilots ir bez maksas un bez kredītkartes. Sazināsimies 1 darba dienas laikā.
          </p>
          <Link
            href="/pilotprojekts"
            className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
          >
            Pieteikties pilotam
          </Link>
        </div>
      </main>

      <LandingFooter tone="light" />
    </div>
  );
}
