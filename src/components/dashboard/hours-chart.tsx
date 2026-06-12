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

export interface HoursDataPoint {
  name: string;
  hours: number;
}

interface HoursChartProps {
  title: string;
  data: HoursDataPoint[];
}

export function HoursChart({ title, data }: HoursChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[180px]" />
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[180px] text-sm text-muted-foreground">
          Nav apstiprinātu ierakstu
        </CardContent>
      </Card>
    );
  }

  const isDark = resolvedTheme === "dark";
  const textColor = isDark ? "#9ca3af" : "#8a94a6";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "#e5e8ec";
  const barColor = isDark ? "#34d399" : "#1f2933";
  const tooltipBg = isDark ? "rgba(8, 16, 30, 0.88)" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.10)" : "#e5e7eb";

  const chartHeight = Math.max(180, data.length * 36 + 24);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={data}
            layout="vertical"
            barSize={14}
            margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: textColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              unit="h"
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fill: textColor, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={76}
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
              cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}
            />
            <Bar dataKey="hours" fill={barColor} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
