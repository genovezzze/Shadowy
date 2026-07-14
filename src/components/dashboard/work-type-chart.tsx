"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface WorkTypeDataPoint {
  name: string;
  value: number;
  color: string;
}

interface WorkTypeChartProps {
  title: string;
  data: WorkTypeDataPoint[];
}

export function WorkTypeChart({ title, data }: WorkTypeChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const total = data.reduce((s, d) => s + d.value, 0);

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

  if (total === 0) {
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

  const isDark = resolvedTheme !== "light";
  const tooltipBg = isDark ? "rgba(8, 16, 30, 0.88)" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.10)" : "#e5e7eb";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data.map((d) => ({ ...d, fill: d.color }))}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={68}
              dataKey="value"
              paddingAngle={3}
              strokeWidth={0}
            />
            <Tooltip
              contentStyle={{
                background: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: "8px",
                fontSize: 12,
                color: isDark ? "#f9fafb" : "#111827",
              }}
              formatter={(value) => [value, ""]}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-[11px] text-muted-foreground">{d.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
