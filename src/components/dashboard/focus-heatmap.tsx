"use client";

interface DayData {
  date: string;
  categories: number;
  isFuture: boolean;
}

const LV_DAYS = ["P", "O", "T", "C", "Pk", "S", "Sv"];

function colorFor(cats: number, future: boolean) {
  if (future) return "bg-black/[0.02] dark:bg-white/[0.03]";
  if (cats === 0) return "bg-black/[0.05] dark:bg-white/[0.08]";
  if (cats === 1) return "bg-[#34C759] dark:bg-[#30D158]";
  if (cats <= 3) return "bg-[#FF9500] dark:bg-[#FF9F0A]";
  return "bg-[#FF3B30]/80 dark:bg-[#FF453A]/80";
}

function titleFor(date: string, cats: number, future: boolean) {
  if (future) return date;
  if (cats === 0) return `${date} - nav ierakstu`;
  if (cats === 1) return `${date} - fokusēts (1 kat.)`;
  if (cats <= 3) return `${date} - mērens (${cats} kat.)`;
  return `${date} - izkaisīts (${cats} kat.)`;
}

export function FocusHeatmap({ days }: { days: DayData[] }) {
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 mb-1">
        {LV_DAYS.map((d) => (
          <div key={d} className="text-center text-[12px] text-muted-foreground">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => (
          <div
            key={day.date}
            title={titleFor(day.date, day.categories, day.isFuture)}
            className={`aspect-square rounded-md ${colorFor(day.categories, day.isFuture)}`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-muted-foreground">
        {[
          { cls: "bg-[#34C759] dark:bg-[#30D158]", label: "Fokusēts (1 kat.)" },
          { cls: "bg-[#FF9500] dark:bg-[#FF9F0A]", label: "Mērens (2-3)" },
          { cls: "bg-[#FF3B30]/80 dark:bg-[#FF453A]/80", label: "Izkaisīts (4+)" },
        ].map(({ cls, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${cls}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
