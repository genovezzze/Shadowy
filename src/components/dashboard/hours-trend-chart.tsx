"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart as LineChartIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { APPLE_CARD_LABEL, METRIC_SURFACE, TINT_HEX, TINT_TILE, type MetricTint , QUIET_LABEL} from "@/components/dashboard/apple";

export interface HoursTrendDataPoint {
  label: string;
  value: number;
}

interface HoursTrendChartProps {
  title: string;
  data: HoursTrendDataPoint[];
  badge?: ReactNode;
  /** Opts the chart into the new card style with this line colour. */
  tint?: MetricTint;
  /** Colour of the label's icon tile; defaults to the line colour. */
  iconTint?: MetricTint;
  /** Title in the quiet display face instead of the bold heading face. */
  quietLabel?: boolean;
  className?: string;
}

export function HoursTrendChart({ title, data, badge, className, tint, iconTint, quietLabel }: HoursTrendChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[180px]" />
      </Card>
    );
  }

  const isDark = resolvedTheme !== "light";
  const textColor = tint ? "#8E8E93" : isDark ? "#9ca3af" : "#8a94a6";
  const gridColor = tint ? (isDark ? "rgba(84,84,88,0.45)" : "rgba(60,60,67,0.12)") : isDark ? "rgba(255,255,255,0.06)" : "#e5e8ec";
  const lineColor = tint ? (isDark ? TINT_HEX[tint].dark : TINT_HEX[tint].light) : isDark ? "#34d399" : "#1f2933";
  const tooltipBg = isDark ? "rgba(8, 16, 30, 0.88)" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.10)" : "#e5e7eb";

  // The tinted variant skips Card: its glass shadow and gradient would show through.
  const Shell = tint ? "div" : Card;
  const Body = tint ? "div" : CardContent;

  return (
    <Shell className={tint ? cn(METRIC_SURFACE, "p-5", className) : className}>
      {tint ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className={cn(APPLE_CARD_LABEL, TINT_TILE[iconTint ?? tint], quietLabel && QUIET_LABEL)}>
            <LineChartIcon />
            {title}
          </div>
          {badge ? <span className="text-[13px] text-muted-foreground">{badge}</span> : null}
        </div>
      ) : (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            {badge ? <span className="text-xs text-muted-foreground">{badge}</span> : null}
          </div>
        </CardHeader>
      )}
      <Body>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="hoursTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.35} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: textColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: textColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              unit="h"
            />
            <Tooltip
              contentStyle={{
                background: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: "8px",
                fontSize: 12,
                color: isDark ? "#f9fafb" : "#111827",
              }}
              formatter={(v) => [`${v}h`, "Stundas"]}
              cursor={{ stroke: lineColor, strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2}
              fill="url(#hoursTrendFill)"
              dot={{ r: 3, stroke: lineColor, strokeWidth: 2, fill: tint ? (isDark ? "#232326" : "#ffffff") : isDark ? "#0a0f1a" : "#ffffff" }}
              activeDot={{ r: 5, stroke: lineColor, strokeWidth: 2, fill: lineColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Body>
    </Shell>
  );
}
