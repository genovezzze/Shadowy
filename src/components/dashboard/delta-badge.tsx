import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

/**
 * Period-over-period change indicator. `neutralColors` shows the arrow without
 * good/bad colouring — for metrics where "up" is not inherently better (e.g.
 * total invisible-work hours, which is descriptive, not a target).
 */
export function DeltaBadge({
  current,
  previous,
  suffix = "",
  neutralColors = true,
  label,
}: {
  current: number;
  previous: number;
  suffix?: string;
  neutralColors?: boolean;
  /** Short caption clarifying what the % compares against, e.g. "pret iepr. 30 d." */
  label?: string;
}) {
  if (previous <= 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  const up = pct > 0;
  const Icon = pct === 0 ? Minus : up ? ArrowUpRight : ArrowDownRight;
  const color =
    pct === 0
      ? "text-muted-foreground"
      : neutralColors
        ? "text-foreground/70"
        : up
          ? "text-emerald-500"
          : "text-amber-500";
  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap" title="Izmaiņas salīdzinājumā ar iepriekšējo, tikpat garu periodu">
      <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium tabular-nums ${color}`}>
        <Icon className="h-3 w-3 self-center" />
        {up ? "+" : ""}{pct}%{suffix}
      </span>
      {label && <span className="text-[10px] text-muted-foreground/70">{label}</span>}
    </span>
  );
}
