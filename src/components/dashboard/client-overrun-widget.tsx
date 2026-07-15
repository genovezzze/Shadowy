import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Props {
  overrunCount: number;
  totalClients: number;
  totalOverrunEur: number;
  anchorHref?: string;
}

export function ClientOverrunWidget({ overrunCount, totalClients, totalOverrunEur, anchorHref }: Props) {
  if (overrunCount === 0) return null;

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
          <div className="text-4xl font-bold tabular-nums">−€{totalOverrunEur.toLocaleString("de-DE")}</div>
          <p className="mt-1 text-sm text-muted-foreground">
            {overrunCount} no {totalClients} {totalClients === 1 ? "klienta" : "klientiem"} pārsniedz mēneša limitu
          </p>
        </div>

        {anchorHref && (
          <a
            href={anchorHref}
            className="flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground sm:self-auto"
          >
            Skatīt detalizēti
          </a>
        )}
      </div>
    </Card>
  );
}
