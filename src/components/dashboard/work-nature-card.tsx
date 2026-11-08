"use client";

import { useState } from "react";
import { ChevronDown, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { APPLE_CARD_LABEL, APPLE_FILL, APPLE_SEPARATOR, METRIC_SURFACE, TINT_FILL, TINT_TILE , QUIET_LABEL} from "@/components/dashboard/apple";
import type { HelpPair, WorkNatureBreakdown } from "@/lib/work-nature";
import { formatDurationLV } from "@/lib/utils";
import { HelpFlowChart } from "@/components/dashboard/help-flow-chart";

/**
 * The nature axis of the period's work, cross-cutting the category list: the
 * same entry is counted here and under its category, so these shares are of all
 * entries and do not belong to the category list's 100%.
 */
export function WorkNatureCard({
  rows,
  totalEntries,
  helpPairs = [],
  apple = false,
}: {
  rows: WorkNatureBreakdown[];
  totalEntries: number;
  helpPairs?: HelpPair[];
  /** Apple-style surface and colours, used on the admin overview. */
  apple?: boolean;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (rows.length === 0) return null;

  return (
    <div className={apple ? cn(METRIC_SURFACE, "overflow-hidden") : "overflow-hidden rounded-xl border border-border bg-card"}>
      {apple ? (
        <div className="flex items-center justify-between gap-4 px-5 pb-1 pt-5">
          <div className={cn(APPLE_CARD_LABEL, TINT_TILE.neutral, QUIET_LABEL)}>
            <Layers />
            Darba raksturs
          </div>
          <span className="text-[13px] text-muted-foreground">{totalEntries} ieraksti</span>
        </div>
      ) : (
        <div className="flex items-center justify-between border-b border-border/40 px-4 py-2.5">
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Darba raksturs
          </span>
          <span className="text-[10px] text-muted-foreground/60">
            {totalEntries} ieraksti
          </span>
        </div>
      )}

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
                    ? apple ? APPLE_FILL : "bg-muted/50 ring-1 ring-border/60"
                    : hasDetail
                      ? apple ? "hover:bg-black/[0.03] dark:hover:bg-white/[0.04]" : "ring-1 ring-transparent hover:bg-muted/40 hover:ring-border/40"
                      : ""
                }`}
              >
                <div className="w-44 shrink-0 truncate text-sm font-medium text-foreground/80">
                  {row.label}
                </div>
                <div className={cn("h-1.5 flex-1 overflow-hidden rounded-full", apple ? APPLE_FILL : "bg-muted")}>
                  <div
                    className={`h-full rounded-full ${
                      apple ? TINT_FILL.blue : isOpen ? "bg-emerald-500/80" : "bg-foreground/40"
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

      {helpPairs.length > 0 && <HelpFlowChart pairs={helpPairs} apple={apple} />}

      <div className={apple ? cn("border-t px-5 py-3", APPLE_SEPARATOR) : "border-t border-border/40 px-4 py-2"}>
        <p className={apple ? "text-[13px] text-muted-foreground" : "text-[11px] text-muted-foreground"}>
          Procenti no visiem ierakstiem, nevis no kategorijām - šis ir atsevišķs
          griezums, kas krustojas ar tām.
        </p>
      </div>
    </div>
  );
}
