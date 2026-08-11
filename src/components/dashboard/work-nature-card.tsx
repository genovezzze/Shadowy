"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { HelpPair, WorkNatureBreakdown } from "@/lib/work-nature";
import { formatDurationLV } from "@/lib/utils";

/**
 * The nature axis of the period's work, cross-cutting the category list: the
 * same entry is counted here and under its category, so these shares are of all
 * entries and do not belong to the category list's 100%.
 */
export function WorkNatureCard({
  rows,
  totalEntries,
  helpPairs = [],
}: {
  rows: WorkNatureBreakdown[];
  totalEntries: number;
  helpPairs?: HelpPair[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (rows.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-2.5">
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Darba raksturs
        </span>
        <span className="text-[10px] text-muted-foreground/60">
          {totalEntries} ieraksti
        </span>
      </div>

      <div className="space-y-0.5 p-3">
        {rows.map((row) => {
          const isOpen = expanded === row.key;
          const hasDetail = row.topCategories.length > 0;
          return (
            <div key={row.key}>
              <button
                onClick={() => hasDetail && setExpanded(isOpen ? null : row.key)}
                className={`group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-all ${
                  hasDetail ? "cursor-pointer" : "cursor-default"
                } ${
                  isOpen
                    ? "bg-muted/50 ring-1 ring-border/60"
                    : hasDetail
                      ? "ring-1 ring-transparent hover:bg-muted/40 hover:ring-border/40"
                      : ""
                }`}
              >
                <div className="w-44 shrink-0 truncate text-sm font-medium text-foreground/80">
                  {row.label}
                </div>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${
                      isOpen ? "bg-emerald-500/80" : "bg-foreground/40"
                    }`}
                    style={{ width: `${row.barPct}%` }}
                  />
                </div>
                <div className="w-16 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  {row.count} · {row.pct}%
                </div>
                <div className="w-20 shrink-0 text-right text-xs tabular-nums text-muted-foreground/70">
                  {formatDurationLV(row.minutes)}
                </div>
                {hasDetail && (
                  <ChevronDown
                    className={`h-3 w-3 shrink-0 text-muted-foreground/60 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>

              {isOpen && (
                <div className="mx-2 mb-2 mt-1 rounded-lg border border-border/50 bg-muted/10 px-4 py-3">
                  <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                    Kāds darbs
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {row.topCategories.map((category) => (
                      <span
                        key={category.label}
                        className="text-xs text-foreground/80"
                      >
                        {category.label}{" "}
                        <span className="tabular-nums text-muted-foreground">
                          {category.count}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {helpPairs.length > 0 && (
        <div className="border-t border-border/40 bg-muted/10 px-4 py-2.5">
          <span className="text-[11px] text-muted-foreground">
            Biežāk palīdz:{" "}
            {helpPairs.map((pair, index) => (
              <span key={`${pair.from}-${pair.to}`}>
                {index > 0 ? " · " : ""}
                <span className="text-foreground/70">
                  {pair.from} → {pair.to}
                </span>{" "}
                ({pair.count}×, {formatDurationLV(pair.minutes)})
              </span>
            ))}
          </span>
        </div>
      )}

      <div className="border-t border-border/40 px-4 py-2">
        <p className="text-[11px] text-muted-foreground">
          Procenti no visiem ierakstiem, nevis no kategorijām - šis ir atsevišķs
          griezums, kas krustojas ar tām.
        </p>
      </div>
    </div>
  );
}
