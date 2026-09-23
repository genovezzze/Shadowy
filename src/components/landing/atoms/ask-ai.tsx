"use client";

import * as React from "react";
import { SiClaude, SiPerplexity, SiGooglegemini } from "react-icons/si";
import { RiGrokAiFill } from "react-icons/ri";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/landing/atoms/i18n";

// "Ask an AI about us": each button opens an assistant with a pre-filled prompt
// about Shadowy, plus a link to the machine-readable llms.txt. Icons are the
// real brand marks (react-icons / simple-icons set), in their brand colours on
// dark rounded squares, like the atoms.technology row.

type Provider = {
  name: string;
  href: (q: string) => string;
  Icon: React.ComponentType;
};

// OpenAI is not in the icon set, so its official mark is inlined here (used
// functionally, only to open ChatGPT).
function OpenAIIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="#ffffff" className="size-5" aria-hidden>
      <path d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.51-2.9A6.07 6.07 0 0 0 4.98 4.18a5.98 5.98 0 0 0-3.99 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .52 4.91 6.05 6.05 0 0 0 6.51 2.9A5.98 5.98 0 0 0 13.26 24a6.06 6.06 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07zM13.26 22.43a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.79.79 0 0 0 .39-.68v-6.74l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.49 4.5zM3.6 18.3a4.47 4.47 0 0 1-.54-3.01l.14.09 4.78 2.76a.77.77 0 0 0 .78 0l5.84-3.37v2.33a.08.08 0 0 1-.03.06L9.74 19.9a4.5 4.5 0 0 1-6.14-1.64zM2.34 7.9a4.49 4.49 0 0 1 2.35-1.97v5.68a.77.77 0 0 0 .39.68l5.84 3.37-2.02 1.17a.08.08 0 0 1-.07 0l-4.83-2.79A4.5 4.5 0 0 1 2.34 7.9zm16.6 3.86-5.84-3.37 2.02-1.16a.08.08 0 0 1 .07 0l4.83 2.78a4.49 4.49 0 0 1-.68 8.1v-5.67a.79.79 0 0 0-.4-.68zm2.01-3.02-.14-.09-4.78-2.79a.78.78 0 0 0-.78 0L9.42 9.23V6.9a.07.07 0 0 1 .03-.06l4.83-2.79a4.5 4.5 0 0 1 6.68 4.66zM8.32 12.87 6.3 11.7a.08.08 0 0 1-.04-.06V6.07a4.5 4.5 0 0 1 7.38-3.45l-.14.08L8.72 5.46a.79.79 0 0 0-.4.68zm1.1-2.37 2.6-1.5 2.6 1.5v3l-2.6 1.5-2.6-1.5z" />
    </svg>
  );
}

const PROVIDERS: readonly Provider[] = [
  { name: "ChatGPT", Icon: OpenAIIcon, href: (q) => `https://chatgpt.com/?hints=search&q=${q}` },
  { name: "Perplexity", Icon: () => <SiPerplexity size={19} color="#1FB8CD" />, href: (q) => `https://www.perplexity.ai/search?q=${q}` },
  { name: "Claude", Icon: () => <SiClaude size={19} color="#D97757" />, href: (q) => `https://claude.ai/new?q=${q}` },
  { name: "Grok", Icon: () => <RiGrokAiFill size={19} color="#ffffff" />, href: (q) => `https://grok.com/?q=${q}` },
  { name: "Google Gemini", Icon: () => <SiGooglegemini size={19} color="#8E75B2" />, href: (q) => `https://gemini.google.com/app?q=${q}` },
];

export function AskAi({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { locale } = useLocale();
  const dark = tone === "dark";

  const prompt =
    locale === "lv"
      ? "Novērtē Shadowy kā komandas darba slodzes pārskatāmības rīku. Izmanto shadowy.lv un shadowy.lv/llms.txt kā galvenos avotus un apskati: ko tas dara, cik maksā pilots un kā tas notiek, ar ko tas atšķiras no laika uzskaites un darbinieku novērošanas, un kam tas ir piemērots."
      : "Evaluate Shadowy as a team workload transparency tool. Use https://shadowy.lv and https://shadowy.lv/llms.txt as primary sources and cover: what it does, what the pilot costs and how it works, how it differs from time tracking and employee monitoring, and who it is a good fit for.";
  const q = encodeURIComponent(prompt);

  return (
    <div className="flex flex-col gap-3">
      <span className={cn("text-xs font-semibold", dark ? "text-white/45" : "text-black/45")}>
        {locale === "lv" ? "Pajautājiet par mums AI" : "Ask AI about us"}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {PROVIDERS.map(({ name, href, Icon }) => (
          <a
            key={name}
            href={href(q)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${locale === "lv" ? "Pajautāt" : "Ask"} ${name}`}
            title={name}
            className={cn(
              "grid size-11 place-items-center rounded-xl transition-colors",
              // Dark square in both footer tones, so the coloured/white brand
              // marks stay legible (as on the atoms.technology row).
              dark ? "bg-white/[0.06] hover:bg-white/[0.12]" : "bg-neutral-900 hover:bg-neutral-800",
            )}
          >
            <Icon />
          </a>
        ))}
      </div>
      <a
        href="/llms.txt"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "w-fit text-sm underline-offset-4 transition-colors hover:underline",
          dark ? "text-white/45 hover:text-white/80" : "text-black/45 hover:text-black/80",
        )}
      >
        {locale === "lv" ? "Atvērt llms.txt" : "Open llms.txt"}
      </a>
    </div>
  );
}
