"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ChartItem {
  label: string;
  minutes: number;
}

function formatTooltip(value: unknown): [string, string] {
  const v = typeof value === "number" ? value : 0;
  if (v === 0) return ["—", "Laiks"];
  const h = Math.floor(v / 60);
  const m = v % 60;
  return [h > 0 ? `${h}h ${m}m` : `${m}m`, "Laiks"];
}

function yTickFormatter(value: number) {
  if (value === 0) return "0";
  const h = Math.floor(value / 60);
  return h > 0 ? `${h}h` : `${value}m`;
}

export function ClientMonthChart({ data }: { data: ChartItem[] }) {
  const maxVal = Math.max(...data.map((d) => d.minutes), 1);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barSize={28} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={yTickFormatter}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip
          formatter={formatTooltip}
          cursor={{ fill: "hsl(var(--muted))" }}
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
        />
        <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={
                entry.minutes === maxVal && maxVal > 0
                  ? "hsl(var(--primary))"
                  : "hsl(var(--primary) / 0.4)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
