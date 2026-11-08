"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { APPLE_CARD_LABEL, METRIC_SURFACE, TINT_HEX, type MetricTint, TINT_TILE , QUIET_LABEL} from "@/components/dashboard/apple";

export interface ActivityDataPoint {
  label: string;
  value: number;
}

interface ActivityChartProps {
  title: string;
  data: ActivityDataPoint[];
  valueLabel?: string;
  className?: string;
  /** Opts the chart into the Apple style with this colour. */
  tint?: MetricTint;
  /** Colour of the label's icon tile; defaults to the bar colour. */
  iconTint?: MetricTint;
  /** Title in the quiet display face instead of the bold heading face. */
  quietLabel?: boolean;
}

export function ActivityChart({
  title,
  data,
  valueLabel = "Ieraksti",
  className,
  tint,
  iconTint,
  quietLabel,
}: ActivityChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (tint) {
    const isDark = !mounted || resolvedTheme !== "light";
    const hex = isDark ? TINT_HEX[tint].dark : TINT_HEX[tint].light;
    return (
      <div className={cn(METRIC_SURFACE, "p-5", className)}>
        <div className={cn(APPLE_CARD_LABEL, TINT_TILE[iconTint ?? tint], quietLabel && QUIET_LABEL)}>
          <BarChart3 />
          {title}
        </div>
        <div className="mt-4 h-[220px]">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barCategoryGap="30%" margin={{ top: 4, right: -8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={isDark ? "rgba(84,84,88,0.45)" : "rgba(60,60,67,0.12)"} strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#8E8E93", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8E8E93", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} orientation="right" />
                <Tooltip
                  contentStyle={{
                    background: isDark ? "#2c2c2e" : "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                    fontSize: 13,
                    color: isDark ? "#ffffff" : "#000000",
                  }}
                  cursor={{ fill: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", radius: 6 }}
                />
                <Bar dataKey="value" name={valueLabel} fill={hex} radius={[6, 6, 6, 6]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  }

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
  const textColor = isDark ? "#9ca3af" : "#8a94a6";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "#e5e8ec";
  const barColor = isDark ? "#34d399" : "#1f2933";
  const tooltipBg = isDark ? "rgba(10, 10, 10, 0.92)" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.10)" : "#e5e7eb";

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={data}
            barSize={18}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
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
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: "8px",
                fontSize: 12,
                color: isDark ? "#f9fafb" : "#111827",
              }}
              cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}
            />
            <Bar dataKey="value" name={valueLabel} fill={barColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
