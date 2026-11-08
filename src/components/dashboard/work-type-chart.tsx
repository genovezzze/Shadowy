"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { APPLE_CARD_LABEL, APPLE_SEPARATOR, METRIC_SURFACE, TINT_TILE , QUIET_LABEL} from "@/components/dashboard/apple";

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

  const header = (
    <div className={cn(APPLE_CARD_LABEL, TINT_TILE.neutral, QUIET_LABEL)}>
      <PieChartIcon />
      {title}
    </div>
  );

  if (!mounted || total === 0) {
    return (
      <div className={cn(METRIC_SURFACE, "p-5")}>
        {header}
        <div className="flex h-[220px] items-center justify-center text-[14px] text-muted-foreground">
          {mounted ? "Nav apstiprinātu ierakstu" : null}
        </div>
      </div>
    );
  }

  const isDark = resolvedTheme !== "light";

  return (
    <div className={cn(METRIC_SURFACE, "p-5")}>
      {header}
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data.map((d) => ({ ...d, fill: d.color }))}
            cx="50%"
            cy="50%"
            innerRadius={56}
            outerRadius={76}
            dataKey="value"
            paddingAngle={3}
            cornerRadius={4}
            strokeWidth={0}
          />
          <Tooltip
            contentStyle={{
              background: isDark ? "#2c2c2e" : "#ffffff",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              fontSize: 13,
              color: isDark ? "#ffffff" : "#000000",
            }}
            formatter={(value) => [value, ""]}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className={cn("mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 border-t pt-3", APPLE_SEPARATOR)}>
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-[13px] text-muted-foreground">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
