"use client";

import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { APPLE_CARD_LABEL, APPLE_PILL, METRIC_SURFACE, TINT_TILE , QUIET_LABEL} from "@/components/dashboard/apple";

interface Props {
  overrunCount: number;
  totalClients: number;
  totalOverrunEur: number;
  monthLabel: string;
  anchorHref?: string;
  detailEventName?: string;
  /** Apple-style surface and type, used on the admin overview. */
  apple?: boolean;
}

export function ClientOverrunWidget({
  overrunCount,
  totalClients,
  totalOverrunEur,
  monthLabel,
  anchorHref,
  detailEventName,
  apple = false,
}: Props) {
  if (overrunCount === 0) return null;

  if (apple) {
    const action = detailEventName ? (
      <button type="button" onClick={() => window.dispatchEvent(new Event(detailEventName))} className={cn(APPLE_PILL, "self-start sm:self-auto")}>
        Skatīt detalizēti
      </button>
    ) : anchorHref ? (
      <a href={anchorHref} className={cn(APPLE_PILL, "self-start sm:self-auto")}>
        Skatīt detalizēti
      </a>
    ) : null;

    return (
      <div className={cn(METRIC_SURFACE, "mb-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between")}>
        <div className="min-w-0">
          <div className={cn(APPLE_CARD_LABEL, "mb-3", TINT_TILE.red, QUIET_LABEL)}>
            <AlertTriangle />
            Klientu limitu pārsniegums
          </div>
          <div className="font-display text-[34px] font-medium tracking-tight leading-none tabular-nums">
            −€{totalOverrunEur.toLocaleString("de-DE")}
          </div>
          <p className="mt-2 text-[15px] text-muted-foreground">
            {overrunCount} no {totalClients} {totalClients === 1 ? "klienta" : "klientiem"} pārsniedz mēneša limitu · {monthLabel}
          </p>
        </div>
        {action}
      </div>
    );
  }

  const detailClasses =
    "flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground sm:self-auto";

  return (
    <Card className="relative mb-8 border-red-500/20 bg-red-500/[0.03] p-0 dark:border-red-500/15">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Klientu limitu pārsniegums
            </span>
          </div>
          <div className="text-4xl font-bold tabular-nums">
            −€{totalOverrunEur.toLocaleString("de-DE")}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {overrunCount} no {totalClients} {totalClients === 1 ? "klienta" : "klientiem"} pārsniedz mēneša limitu · {monthLabel}
          </p>
        </div>

        {detailEventName ? (
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(detailEventName))}
            className={detailClasses}
          >
            Skatīt detalizēti
          </button>
        ) : anchorHref ? (
          <a href={anchorHref} className={detailClasses}>
            Skatīt detalizēti
          </a>
        ) : null}
      </div>
    </Card>
  );
}
