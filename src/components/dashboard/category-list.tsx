"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type TitleRow = {
  title: string;
  count: number;
  pct: number;   // % of category total (for label)
  barPct: number; // % relative to top title (for bar width)
};

type CategoryItem = {
  name: string;
  count: number;
  pct: number;
  isPattern: boolean;
  titles: TitleRow[];
};

function DrillPanel({ item }: { item: CategoryItem }) {
  return (
    <div className="mx-1 mb-2 mt-1 rounded-xl border border-border/50 bg-muted/10 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border/40 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          Biežākie nosaukumi
        </span>
        <span className="text-[10px] text-muted-foreground/60">{item.count} ieraksti</span>
      </div>
      <div className="p-3 space-y-1">
        {item.titles.map((t, j) => (
          <div key={j} className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/30 transition-colors">
            <div className="w-4 shrink-0 text-[10px] text-muted-foreground/40 tabular-nums text-right">{j + 1}.</div>
            <div className="flex-1 truncate text-xs text-foreground/80 min-w-0">{t.title}</div>
            <div className="w-28 h-1.5 bg-muted/60 rounded-full overflow-hidden shrink-0">
              <div
                className="h-full bg-emerald-500/50 rounded-full"
                style={{ width: `${t.barPct}%` }}
              />
            </div>
            <div className="text-[11px] text-muted-foreground w-14 text-right tabular-nums shrink-0">
              {t.count} · {t.pct}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategoryList({
  items,
  patternCategory,
}: {
  items: CategoryItem[];
  patternCategory?: string | null;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-0.5">
      {items.map((cat, i) => {
        const isOpen = expanded === cat.name;
        const isPattern = cat.name === patternCategory;
        const hasTitles = cat.titles.length > 0;

        return (
          <div key={cat.name}>
            <button
              onClick={() => hasTitles && setExpanded(isOpen ? null : cat.name)}
              className={`group w-full flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all text-left ${
                hasTitles ? "cursor-pointer" : "cursor-default"
              } ${
                isOpen
                  ? "bg-muted/50 ring-1 ring-border/60"
                  : hasTitles
                  ? "hover:bg-muted/40 ring-1 ring-transparent hover:ring-border/40"
                  : ""
              }`}
            >
              <div className="w-5 shrink-0 text-xs text-muted-foreground/40 tabular-nums text-right">{i + 1}.</div>
              <div
                className={`w-36 shrink-0 truncate text-sm font-medium ${
                  isPattern
                    ? "text-amber-500"
                    : isOpen
                    ? "text-foreground"
                    : "text-foreground/80"
                }`}
              >
                {cat.name}
                {isPattern && " ⚠"}
              </div>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-colors ${
                    isPattern ? "bg-amber-500/70" : isOpen ? "bg-emerald-500/80" : "bg-foreground/40"
                  }`}
                  style={{ width: `${cat.pct}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground tabular-nums w-16 text-right shrink-0">
                {cat.count} · {cat.pct}%
              </div>
              {hasTitles && (
                <div
                  className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium shrink-0 transition-all ${
                    isOpen
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-muted text-muted-foreground/60 group-hover:bg-muted/80 group-hover:text-foreground/70"
                  }`}
                >
                  <span className="tabular-nums">{cat.titles.length}</span>
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </div>
              )}
            </button>
            {isOpen && <DrillPanel item={cat} />}
          </div>
        );
      })}
    </div>
  );
}
