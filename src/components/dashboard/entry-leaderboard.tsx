import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { APPLE_CARD_LABEL, APPLE_FILL, APPLE_SEPARATOR, METRIC_SURFACE, TINT_FILL, TINT_TILE , QUIET_LABEL} from "@/components/dashboard/apple";

export type LeaderboardRow = {
  id: string;
  name: string;
  count: number;
};

export function EntryLeaderboard({
  rows,
  title = "Ierakstu aktivitāte",
  subtitle,
  apple = false,
}: {
  rows: LeaderboardRow[];
  title?: string;
  subtitle?: string;
  /** Apple style: one colour for every row, no podium (CLAUDE.md, principle 1). */
  apple?: boolean;
}) {
  if (rows.length === 0) return null;

  if (apple) {
    const top = Math.max(1, ...rows.map((r) => r.count));
    return (
      <div className={cn(METRIC_SURFACE, "mb-8 overflow-hidden")}>
        <div className="flex items-center justify-between gap-4 px-5 pb-2 pt-5">
          <div className={cn(APPLE_CARD_LABEL, TINT_TILE.neutral, QUIET_LABEL)}>
            <BarChart3 />
            {title}
          </div>
          {subtitle && <span className="text-[13px] text-muted-foreground">{subtitle}</span>}
        </div>
        <div className="pb-2">
          {rows.map((row, i) => (
            <div key={row.id} className="flex h-11 items-center gap-4 pl-5">
              <div className={cn("flex h-full flex-1 items-center gap-4 pr-5", i > 0 && cn("border-t", APPLE_SEPARATOR))}>
                <div className="w-40 shrink-0 truncate text-[15px]">{row.name}</div>
                <div className={cn("h-1.5 flex-1 overflow-hidden rounded-full", APPLE_FILL)}>
                  <div className={cn("h-full rounded-full", TINT_FILL.green)} style={{ width: `${Math.round((row.count / top) * 100)}%` }} />
                </div>
                <div className="w-12 shrink-0 text-right text-[15px] tabular-nums text-muted-foreground">{row.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const max = rows[0]?.count ?? 1;
  const total = rows.reduce((s, r) => s + r.count, 0);

  // Only the top three stand out in colour; the rest stay muted.
  const PALETTE = [
    "#34d399", // 1st - emerald
    "#60a5fa", // 2nd - blue
    "#f472b6", // 3rd - pink
  ];

  return (
    <Card className="mb-8 overflow-hidden p-0">
      <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3">
        <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {subtitle ?? `${total} ieraksti kopā`}
        </span>
      </div>
      <div className="divide-y divide-border/30">
        {rows.map((row, i) => {
          const pct = max > 0 ? Math.round((row.count / max) * 100) : 0;
          const color = PALETTE[i];
          return (
            <div key={row.id} className="flex items-center gap-4 px-5 py-3">
              <div className="w-40 shrink-0 truncate text-sm font-medium text-foreground/90">
                {row.name}
              </div>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${color ? "" : "bg-muted-foreground/40"}`}
                  style={{ width: `${pct}%`, ...(color ? { backgroundColor: color } : {}) }}
                />
              </div>
              <div
                className={`w-16 shrink-0 text-right text-sm font-semibold tabular-nums ${color ? "" : "text-muted-foreground"}`}
                style={color ? { color } : undefined}
              >
                {row.count}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
