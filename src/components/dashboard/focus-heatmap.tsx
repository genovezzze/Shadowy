"use client";

interface DayData {
  date: string;
  categories: number;
  isFuture: boolean;
}

const LV_DAYS = ["P", "O", "T", "C", "Pk", "S", "Sv"];

function colorFor(cats: number, future: boolean) {
  if (future) return "bg-muted/30";
  if (cats === 0) return "bg-muted";
  if (cats === 1) return "bg-emerald-500/75";
  if (cats <= 3) return "bg-amber-400/80";
  return "bg-red-500/65";
}

function titleFor(date: string, cats: number, future: boolean) {
  if (future) return date;
  if (cats === 0) return `${date} — nav ierakstu`;
  if (cats === 1) return `${date} — fokusēts (1 kat.)`;
  if (cats <= 3) return `${date} — mērens (${cats} kat.)`;
  return `${date} — izkaisīts (${cats} kat.)`;
}

export function FocusHeatmap({ days }: { days: DayData[] }) {
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 mb-1">
        {LV_DAYS.map((d) => (
          <div key={d} className="text-[10px] text-center text-muted-foreground">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => (
          <div
            key={day.date}
            title={titleFor(day.date, day.categories, day.isFuture)}
            className={`aspect-square rounded-[3px] ${colorFor(day.categories, day.isFuture)}`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        {[
          { cls: "bg-emerald-500/75", label: "Fokusēts (1 kat.)" },
          { cls: "bg-amber-400/80", label: "Mērens (2–3)" },
          { cls: "bg-red-500/65", label: "Izkaisīts (4+)" },
        ].map(({ cls, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`inline-block h-2.5 w-2.5 rounded-sm ${cls}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
