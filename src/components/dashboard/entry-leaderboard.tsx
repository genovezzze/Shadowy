import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export type LeaderboardRow = {
  id: string;
  name: string;
  count: number;
};

export function EntryLeaderboard({
  rows,
  title = "Ierakstu aktivitāte",
  subtitle,
}: {
  rows: LeaderboardRow[];
  title?: string;
  subtitle?: string;
}) {
  if (rows.length === 0) return null;

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
