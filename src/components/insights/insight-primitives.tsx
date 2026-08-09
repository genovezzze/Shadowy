import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTrendLV } from "@/lib/insights-format";

/** Accent per rank: the three biggest rows get their own colour, the rest stay neutral. */
export const RANK_TONES = [
  { text: "text-emerald-600 dark:text-emerald-400", chip: "bg-emerald-500/12 ring-emerald-500/25", bar: "bg-emerald-500 dark:bg-emerald-400", dot: "bg-emerald-500 dark:bg-emerald-400" },
  { text: "text-sky-600 dark:text-sky-400", chip: "bg-sky-500/12 ring-sky-500/25", bar: "bg-sky-500 dark:bg-sky-400", dot: "bg-sky-500 dark:bg-sky-400" },
  { text: "text-violet-600 dark:text-violet-400", chip: "bg-violet-500/12 ring-violet-500/25", bar: "bg-violet-500 dark:bg-violet-400", dot: "bg-violet-500 dark:bg-violet-400" },
];

export const NEUTRAL_TONE = {
  text: "text-muted-foreground",
  chip: "bg-muted ring-border dark:bg-white/[0.06] dark:ring-white/10",
  bar: "bg-foreground/30 dark:bg-white/35",
  dot: "bg-foreground/30 dark:bg-white/35",
};

export function rankTone(index: number) {
  return RANK_TONES[index] ?? NEUTRAL_TONE;
}

/** A change becomes a signal only once it is big enough to act on. */
export const SIGNIFICANT_TREND = 15;

export function RankBadge({ index, className }: { index: number; className?: string }) {
  const tone = rankTone(index);
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-semibold ring-1 ring-inset",
        tone.chip,
        tone.text,
        className,
      )}
    >
      {String(index + 1).padStart(2, "0")}
    </span>
  );
}

/**
 * The percentage alone reads as a riddle, so the chip says out loud what it is
 * comparing against unless it sits in a place that already explains it.
 */
export function TrendChip({
  percent,
  showLabel = false,
  className,
}: {
  percent: number | null;
  showLabel?: boolean;
  className?: string;
}) {
  if (percent === null) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        nav ar ko salīdzināt
      </span>
    );
  }
  const rising = percent >= SIGNIFICANT_TREND;
  const falling = percent <= -SIGNIFICANT_TREND;
  const Icon = percent > 0 ? TrendingUp : percent < 0 ? TrendingDown : undefined;
  return (
    <span
      title="Salīdzinājumā ar iepriekšējo tikpat garo periodu"
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ring-1 ring-inset",
        rising && "bg-amber-500/12 text-amber-600 ring-amber-500/25 dark:text-amber-400",
        falling && "bg-emerald-500/12 text-emerald-600 ring-emerald-500/25 dark:text-emerald-400",
        !rising && !falling && "bg-muted text-muted-foreground ring-border dark:bg-white/[0.06] dark:ring-white/10",
        className,
      )}
    >
      {Icon ? <Icon className="size-3" /> : null}
      {formatTrendLV(percent)}
      {showLabel ? <span className="font-normal opacity-80">pret iepr. periodu</span> : null}
    </span>
  );
}

export function Sparkline({ points, tone, className }: { points: number[]; tone: string; className?: string }) {
  const max = Math.max(...points, 1);
  return (
    <div
      className={cn("flex h-8 items-end gap-[3px]", className)}
      title="Kā laiks sadalījies periodā, no sākuma līdz beigām"
      aria-hidden
    >
      {points.map((value, index) => (
        <span
          key={index}
          className={cn("w-1.5 rounded-[2px]", tone, index === points.length - 1 ? "opacity-100" : "opacity-40")}
          style={{ height: `${Math.max(10, (value / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

export function ShareBar({
  value,
  max,
  tone,
  className,
}: {
  value: number;
  max: number;
  tone: string;
  className?: string;
}) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-muted dark:bg-white/[0.07]", className)} aria-hidden>
      <div className={cn("h-full rounded-full", tone)} style={{ width: `${Math.max(3, (value / max) * 100)}%` }} />
    </div>
  );
}

export function CardHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b border-border px-4 py-4 sm:px-6 dark:border-white/[0.07]">
      <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function InsightEmpty({ children }: { children: string }) {
  return <div className="px-6 py-12 text-center text-sm text-muted-foreground">{children}</div>;
}
