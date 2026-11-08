"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHIP_GROUP, QUIET_LABEL, chipClass } from "@/components/dashboard/apple";

export interface OverviewSection {
  key: string;
  label: string;
  /** How many blocks the section holds, shown next to its pill. */
  count: number;
  /** Words the search box matches against: the label plus block titles. */
  keywords: string;
  content: ReactNode;
}

/** Lower-case and strip diacritics, so "darba" finds "Darba" and "darbā". */
function fold(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * The overview's pill filter: "Visi" shows every section under its own heading,
 * any other pill shows that section alone. The search box narrows the sections
 * by their titles.
 */
export function OverviewSections({
  intro,
  sections,
  quiet = false,
}: {
  intro?: ReactNode;
  sections: OverviewSection[];
  /** No intro, no counts, search beside the pills, headings in the quiet display face. */
  quiet?: boolean;
}) {
  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");

  const total = sections.reduce((s, x) => s + x.count, 0);

  const visible = useMemo(() => {
    const q = fold(query.trim());
    return sections.filter(
      (s) => (active === "all" || s.key === active) && (!q || fold(`${s.label} ${s.keywords}`).includes(q))
    );
  }, [sections, active, query]);

  const searchBox = (
    <label className="relative w-full shrink-0 sm:w-64">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Meklēt rādītāju"
        aria-label="Meklēt rādītāju"
        className="h-9 w-full rounded-full border border-black/[0.08] bg-white pl-8 pr-3 text-[13px] outline-none transition-colors placeholder:text-muted-foreground focus:border-[#007AFF]/60 dark:border-white/[0.1] dark:bg-white/[0.04]"
      />
    </label>
  );

  return (
    <>
      {quiet ? null : (
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl text-[13px] leading-relaxed text-muted-foreground">{intro}</div>
        {searchBox}
      </div>
      )}

      <div className={cn("mb-6", quiet && "flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between")}>
      <div className="min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className={cn(CHIP_GROUP, "w-max")} role="tablist" aria-label="Pārskata sadaļas">
          {[{ key: "all", label: "Visi", count: total }, ...sections].map((s) => (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={active === s.key}
              onClick={() => setActive(s.key)}
              className={chipClass(active === s.key)}
            >
              {s.label}
              {!quiet && <span className="text-[11px] tabular-nums text-muted-foreground">{s.count}</span>}
            </button>
          ))}
        </div>
      </div>
      {quiet && searchBox}
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-[13px] text-muted-foreground">Nekas netika atrasts</p>
      ) : (
        <div className="space-y-10">
          {visible.map((s) => (
            <section key={s.key} aria-label={s.label}>
              {active === "all" && <h2 className={cn("mb-3", quiet ? cn(QUIET_LABEL, "text-[17px]") : "font-display text-[15px] font-medium")}>{s.label}</h2>}
              {s.content}
            </section>
          ))}
        </div>
      )}
    </>
  );
}
