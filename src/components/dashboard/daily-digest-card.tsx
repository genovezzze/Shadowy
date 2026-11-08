import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { cn, formatDurationLV } from "@/lib/utils";
import { APPLE_CARD_LABEL, METRIC_SURFACE, TINT_TILE , QUIET_LABEL} from "@/components/dashboard/apple";
import { categoryLabel } from "@/lib/work-insights";

export function DailyDigestCard({
  totalCount,
  totalMinutes,
  outsideRoleMinutes,
  entries,
}: {
  totalCount: number;
  totalMinutes: number;
  outsideRoleMinutes: number;
  entries: { id: string; title: string; category: string; durationMinutes: number }[];
}) {
  if (totalCount === 0) {
    return (
      <div className={cn(METRIC_SURFACE, "flex items-center justify-between gap-4 p-4")}>
        <div className="flex min-w-0 items-center gap-3">
          <div className={cn(APPLE_CARD_LABEL, TINT_TILE.neutral, QUIET_LABEL)}>
            <CalendarCheck />
          </div>
          <p className="text-[14px] text-muted-foreground">
            Šodien vēl nav neviena ieraksta. Kad pievienosi pirmo, šeit parādīsies dienas kopsavilkums.
          </p>
        </div>
        <Link
          href="/employee/new-entry"
          className="shrink-0 text-[14px] font-medium text-[#007AFF] hover:underline dark:text-[#0A84FF]"
        >
          Pievienot
        </Link>
      </div>
    );
  }

  return (
    <div className={cn(METRIC_SURFACE, "p-4")}>
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className={cn(APPLE_CARD_LABEL, TINT_TILE.neutral, QUIET_LABEL)}>
            <CalendarCheck />
            Šodien
          </span>
          <span className="text-[13px] text-muted-foreground">
            {totalCount} ieraksti · {formatDurationLV(totalMinutes)}
            {outsideRoleMinutes > 0 ? ` · ${formatDurationLV(outsideRoleMinutes)} ārpus lomas` : ""}
          </span>
        </div>

        <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((e) => (
            <div key={e.id} className="min-w-0">
              <div className="truncate text-[14px] font-medium" title={e.title}>{e.title}</div>
              <div className="text-[13px] text-muted-foreground">
                {categoryLabel(e.category)} · {formatDurationLV(e.durationMinutes)}
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}
