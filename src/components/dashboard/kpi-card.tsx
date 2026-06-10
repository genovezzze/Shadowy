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
}

const TONE_STYLES: Record<
  NonNullable<KpiCardProps["tone"]>,
  { line: string; icon: string; glow: string }
> = {
  default: {
    line: "via-emerald-400/50",
    icon: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
    glow: "hsl(160 84% 45% / 0.15)",
  },
  success: {
    line: "via-emerald-400/50",
    icon: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
    glow: "hsl(160 84% 45% / 0.15)",
  },
  warning: {
    line: "via-amber-400/50",
    icon: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
    glow: "hsl(38 92% 50% / 0.15)",
  },
  destructive: {
    line: "via-red-400/50",
    icon: "bg-red-500/10 text-red-400 ring-red-500/20",
    glow: "hsl(0 84% 55% / 0.15)",
  },
  info: {
    line: "via-sky-400/50",
    icon: "bg-sky-500/10 text-sky-400 ring-sky-500/20",
    glow: "hsl(200 84% 45% / 0.15)",
  },
  accent: {
    line: "via-violet-400/50",
    icon: "bg-violet-500/10 text-violet-400 ring-violet-500/20",
    glow: "hsl(270 84% 45% / 0.13)",
  },
};

export function KpiCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
  className,
}: KpiCardProps) {
  const t = TONE_STYLES[tone] ?? TONE_STYLES.default;

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className={cn("absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent", t.line)} />
      <CardContent className="p-5 pt-5">
        {icon ? (
          <div
            className={cn(
              "mb-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 [&>svg]:h-4 [&>svg]:w-4",
              t.icon
            )}
            style={{ boxShadow: `0 0 14px ${t.glow}` }}
          >
            {icon}
          </div>
        ) : null}
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-1.5 text-3xl font-bold tracking-tight">
          {value}
        </div>
        {hint ? (
          <div className="text-xs text-muted-foreground mt-1.5">{hint}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}
