import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatDurationLV } from "@/lib/utils";
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
      <Card className="mb-8">
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <p className="text-sm text-muted-foreground">
            Šodien vēl nav neviena ieraksta. Kad pievienosi pirmo, šeit parādīsies dienas kopsavilkums.
          </p>
          <Link
            href="/employee/new-entry"
            className="shrink-0 text-sm font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
          >
            Pievienot
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardContent className="p-4">
        <div className="mb-2.5 flex items-baseline gap-2">
          <span className="text-sm font-semibold">Šodien</span>
          <span className="text-xs text-muted-foreground">
            {totalCount} ieraksti · {formatDurationLV(totalMinutes)}
            {outsideRoleMinutes > 0 ? ` · ${formatDurationLV(outsideRoleMinutes)} ārpus lomas` : ""}
          </span>
        </div>

        <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((e) => (
            <div key={e.id} className="min-w-0">
              <div className="truncate text-sm text-foreground/90" title={e.title}>{e.title}</div>
              <div className="text-xs text-muted-foreground">
                {categoryLabel(e.category)} · {formatDurationLV(e.durationMinutes)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
