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

export interface HoursTrendDataPoint {
  label: string;
  value: number;
}

interface HoursTrendChartProps {
  title: string;
  data: HoursTrendDataPoint[];
  badge?: ReactNode;
  className?: string;
}

export function HoursTrendChart({ title, data, badge, className }: HoursTrendChartProps) {
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

  const isDark = resolvedTheme === "dark";
  const textColor = isDark ? "#9ca3af" : "#8a94a6";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "#e5e8ec";
  const lineColor = isDark ? "#34d399" : "#1f2933";
  const tooltipBg = isDark ? "rgba(8, 16, 30, 0.88)" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.10)" : "#e5e7eb";

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {badge ? <span className="text-xs text-muted-foreground">{badge}</span> : null}
        </div>
      </CardHeader>
      <CardContent>
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
              dot={{ r: 3, stroke: lineColor, strokeWidth: 2, fill: isDark ? "#0a0f1a" : "#ffffff" }}
              activeDot={{ r: 5, stroke: lineColor, strokeWidth: 2, fill: lineColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
