import Link from "next/link";
import { ArrowRight, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn, formatDurationLV } from "@/lib/utils";
import { CONFIDENCE_LABELS, formatSavingRangeLV } from "@/lib/insights-format";
import type { ProcessRecommendation } from "@/lib/process-insights";

const CONFIDENCE_DOTS: Record<ProcessRecommendation["confidence"], string> = {
  high: "bg-emerald-500 dark:bg-emerald-400",
  medium: "bg-amber-500 dark:bg-amber-400",
  low: "bg-muted-foreground/60",
};

function RecommendationCard({
  recommendation,
  index,
  entriesHref,
}: {
  recommendation: ProcessRecommendation;
  index: number;
  entriesHref?: (recommendation: ProcessRecommendation) => string;
}) {
  const href = entriesHref?.(recommendation);

  return (
    <div className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/12 px-2.5 py-1 text-xs font-semibold text-violet-600 ring-1 ring-inset ring-violet-500/25 dark:text-violet-300">
          <Lightbulb className="size-3.5" />
          Ieteikums {String(index + 1).padStart(2, "0")}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={cn("size-1.5 rounded-full", CONFIDENCE_DOTS[recommendation.confidence])} />
          {CONFIDENCE_LABELS[recommendation.confidence]}
        </span>
      </div>

      <h3 className="mt-3 text-base font-semibold sm:text-lg">{recommendation.title}</h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{recommendation.description}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Attiecas uz</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {recommendation.processes.map((process) => (
              <span
                key={process.key}
                className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs dark:bg-white/[0.06]"
              >
                <span className="truncate font-medium">{process.label}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{formatDurationLV(process.minutes)}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/[0.07] px-3 py-2.5 sm:min-w-[190px]">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            Iespējamais ietaupījums
          </div>
          <div className="mt-1 text-lg font-semibold tabular-nums">
            {formatSavingRangeLV(recommendation.savingLowMinutes, recommendation.savingHighMinutes)}
          </div>
          <div className="text-[11px] text-muted-foreground">izvēlētajā periodā</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3 text-xs text-muted-foreground dark:border-white/[0.07]">
        <span>{recommendation.evidence}</span>
        {href ? (
          <Link href={href} className="inline-flex items-center gap-1 font-medium text-foreground underline-offset-4 hover:underline">
            Ieraksti <ArrowRight className="size-3" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function RecommendationList({
  recommendations,
  limit = 4,
  entriesHref,
  emptyText = "Vēl nav pietiekami daudz atkārtotu ierakstu, lai sniegtu pamatotu ieteikumu.",
}: {
  recommendations: ProcessRecommendation[];
  limit?: number;
  entriesHref?: (recommendation: ProcessRecommendation) => string;
  emptyText?: string;
}) {
  return (
    <Card className="overflow-hidden">
      {recommendations.length ? (
        <div className="divide-y divide-border dark:divide-white/[0.07]">
          {recommendations.slice(0, limit).map((recommendation, index) => (
            <RecommendationCard
              key={recommendation.processKey}
              recommendation={recommendation}
              index={index}
              entriesHref={entriesHref}
            />
          ))}
        </div>
      ) : (
        <div className="px-6 py-12 text-center text-sm text-muted-foreground">{emptyText}</div>
      )}
    </Card>
  );
}
