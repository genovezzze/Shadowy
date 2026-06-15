import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "warning" | "success" | "destructive" | "info" | "accent";
  className?: string;
  formal?: boolean;
}

const TONE_STYLES: Record<
  NonNullable<KpiCardProps["tone"]>,
  { line: string; icon: string; iconGlow: string; cornerGlow: string }
> = {
  default: {
    line: "via-foreground/30 dark:via-emerald-400/50",
    icon: "bg-foreground/[0.06] text-foreground ring-foreground/10 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
    iconGlow: "var(--kpi-default-glow)",
    cornerGlow: "radial-gradient(circle, hsl(160 84% 45% / 0.35), transparent 70%)",
  },
  success: {
    line: "via-foreground/30 dark:via-emerald-400/50",
    icon: "bg-foreground/[0.06] text-foreground ring-foreground/10 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
    iconGlow: "var(--kpi-default-glow)",
    cornerGlow: "radial-gradient(circle, hsl(160 84% 45% / 0.35), transparent 70%)",
  },
  warning: {
    line: "via-foreground/30 dark:via-amber-400/50",
    icon: "bg-foreground/[0.06] text-foreground ring-foreground/10 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
    iconGlow: "var(--kpi-warning-glow)",
    cornerGlow: "radial-gradient(circle, hsl(38 92% 50% / 0.35), transparent 70%)",
  },
  destructive: {
    line: "via-red-400/50",
    icon: "bg-red-500/10 text-red-400 ring-red-500/20",
    iconGlow: "hsl(0 84% 55% / 0.15)",
    cornerGlow: "radial-gradient(circle, hsl(0 84% 55% / 0.35), transparent 70%)",
  },
  info: {
    line: "via-foreground/30 dark:via-sky-400/50",
    icon: "bg-foreground/[0.06] text-foreground ring-foreground/10 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/20",
    iconGlow: "var(--kpi-info-glow)",
    cornerGlow: "radial-gradient(circle, hsl(200 84% 45% / 0.35), transparent 70%)",
  },
  accent: {
    line: "via-foreground/30 dark:via-violet-400/50",
    icon: "bg-foreground/[0.06] text-foreground ring-foreground/10 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/20",
    iconGlow: "var(--kpi-accent-glow)",
    cornerGlow: "radial-gradient(circle, hsl(270 84% 45% / 0.32), transparent 70%)",
  },
};

export function KpiCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
  className,
  formal = false,
}: KpiCardProps) {
  const t = TONE_STYLES[tone] ?? TONE_STYLES.default;

  if (formal) {
    return (
      <div
        className={cn(
          "glass rounded-xl border border-border bg-card p-5 text-card-foreground",
          "dark:border-white/[0.08] dark:bg-gradient-to-b dark:from-white/[0.05] dark:via-white/[0.03] dark:to-white/[0.01] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_40px_-16px_rgba(0,0,0,0.6)]",
          className
        )}
      >
        {icon ? (
          <div className="mb-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground [&>svg]:h-4 [&>svg]:w-4 dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-white/70">
            {icon}
          </div>
        ) : null}
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-1.5 text-3xl font-bold tracking-tight tabular-nums">{value}</div>
        {hint ? <div className="mt-1.5 text-xs text-muted-foreground">{hint}</div> : null}
      </div>
    );
  }

  return (
    <Card className={cn("group relative overflow-hidden transition-colors duration-300 dark:hover:border-white/[0.10]", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-70 blur-2xl transition-opacity duration-300 group-hover:opacity-100 dark:block hidden"
        style={{ background: t.cornerGlow }}
      />
      <div className={cn("absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent", t.line)} />
      <CardContent className="relative p-5 pt-5">
        {icon ? (
          <div
            className={cn(
              "mb-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 [&>svg]:h-4 [&>svg]:w-4",
              t.icon
            )}
            style={{ boxShadow: `0 0 14px ${t.iconGlow}` }}
          >
            {icon}
          </div>
        ) : null}
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-1.5 text-3xl font-bold tracking-tight tabular-nums">
          {value}
        </div>
        {hint ? (
          <div className="text-xs text-muted-foreground mt-1.5">{hint}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}
