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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ActivityDataPoint {
  label: string;
  value: number;
}

interface ActivityChartProps {
  title: string;
  data: ActivityDataPoint[];
  valueLabel?: string;
  className?: string;
}

export function ActivityChart({
  title,
  data,
  valueLabel = "Ieraksti",
  className,
}: ActivityChartProps) {
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
