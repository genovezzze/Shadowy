import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  CardHeading,
  InsightEmpty,
  RankBadge,
  ShareBar,
  TrendChip,
  rankTone,
} from "@/components/insights/insight-primitives";
import { cn, formatDurationLV } from "@/lib/utils";
import type { ProcessInsight } from "@/lib/process-insights";

function ProcessRow({
  process,
  index,
  maxMinutes,
  href,
}: {
  process: ProcessInsight;
  index: number;
  maxMinutes: number;
  href: string;
}) {
  const tone = rankTone(index);

  return (
    <Link href={href} className="block px-4 py-4 transition-colors hover:bg-muted/40 sm:px-6 dark:hover:bg-white/[0.03]">
      <div className="flex items-start gap-3 sm:gap-4">
        <RankBadge index={index} className="mt-0.5" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className="truncate text-sm font-semibold sm:text-base">{process.label}</span>
            <span className="flex shrink-0 items-baseline gap-2">
              <span className="text-base font-semibold tabular-nums sm:text-lg">{formatDurationLV(process.minutes)}</span>
              <span className="text-xs tabular-nums text-muted-foreground">{process.count} ieraksti</span>
            </span>
          </div>

          <div className="mt-2">
            <ShareBar value={process.minutes} max={maxMinutes} tone={tone.bar} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
            <TrendChip percent={process.trendPercent} showLabel />
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <span className={cn("size-1.5 shrink-0 rounded-full", tone.dot)} />
              <span className="truncate">
                {process.causes[0]?.label ?? "Iemesls ierakstos nav skaidri norādīts"}
              </span>
            </span>
            <span className="tabular-nums">{process.employeeCount} darbinieki</span>
            <span className="tabular-nums">{process.clientCount} klienti</span>
            <span className="tabular-nums">vidēji {formatDurationLV(process.averageMinutes)}</span>
          </div>
        </div>

        <ChevronRight className="mt-1 hidden size-4 shrink-0 text-muted-foreground sm:block" />
      </div>
    </Link>
  );
}

export function ProcessList({
  processes,
  href,
  limit,
  title,
  description,
}: {
  processes: ProcessInsight[];
  href: (process: ProcessInsight) => string;
  limit?: number;
  title?: string;
  description?: string;
}) {
  const visible = limit ? processes.slice(0, limit) : processes;
  const maxMinutes = processes[0]?.minutes ?? 1;

  return (
    <Card className="overflow-hidden">
      {title ? <CardHeading title={title} description={description ?? ""} /> : null}
      {visible.length ? (
        <div className="divide-y divide-border dark:divide-white/[0.07]">
          {visible.map((process, index) => (
            <ProcessRow
              key={process.key}
              process={process}
              index={index}
              maxMinutes={maxMinutes}
              href={href(process)}
            />
          ))}
        </div>
      ) : (
        <InsightEmpty>Šajā periodā nav apstiprinātu ierakstu.</InsightEmpty>
      )}
    </Card>
  );
}
