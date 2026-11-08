import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { METRIC_SURFACE, TILE_BADGE, TINT_SQUARE, type MetricTint } from "@/components/dashboard/apple";

interface StatTileProps {
  icon: ReactNode;
  tint: MetricTint;
  title: string;
  value?: ReactNode;
  description?: ReactNode;
  /** Quiet category line at the bottom of the tile. */
  caption?: string;
  /** Small outlined badge in the top-right corner. */
  badge?: ReactNode;
  className?: string;
  children?: ReactNode;
  /**
   * Quiet type: the title in regular weight and muted colour, the figure in the
   * brand display face, so the number is the one loud thing on the tile.
   */
  quiet?: boolean;
}

/**
 * One tile of the overview grid: a colour square with the icon, a corner badge,
 * a bold title, the figure, a short description and its category underneath.
 */
export function StatTile({ icon, tint, title, value, description, caption, badge, className, children, quiet = true }: StatTileProps) {
  return (
    <div
      className={cn(
        METRIC_SURFACE,
        "flex h-full flex-col p-4 transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_6px_20px_rgba(0,0,0,0.4)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white [&>svg]:h-4 [&>svg]:w-4",
            TINT_SQUARE[tint]
          )}
        >
          {icon}
        </span>
        {badge != null && <span className={TILE_BADGE}>{badge}</span>}
      </div>
      <div className={quiet ? "mt-3 text-[14px] leading-snug text-muted-foreground" : "mt-3 font-display text-[14px] font-medium leading-snug"}>{title}</div>
      {value != null && (
        <div className={quiet ? "mt-1 font-display text-[32px] font-medium leading-tight tracking-tight tabular-nums" : "mt-1 font-display text-[28px] font-medium leading-tight tabular-nums"}>{value}</div>
      )}
      {description != null && (
        <div className="mt-1 text-[13px] leading-snug text-muted-foreground">{description}</div>
      )}
      {children}
      {caption && <div className="mt-auto pt-3 text-[12px] text-muted-foreground/80">{caption}</div>}
    </div>
  );
}
