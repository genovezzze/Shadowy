import Link from "next/link";
import { Clock, Repeat2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { PeriodTabs } from "@/components/dashboard/period-tabs";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { ClientAnalytics, ClientLoadPanel } from "@/components/insights/client-analytics";
import { ProcessList } from "@/components/insights/process-list";
import { RecommendationList } from "@/components/insights/recommendation-list";
import { cn, formatDurationLV } from "@/lib/utils";
import { formatSavingRangeLV } from "@/lib/insights-format";
import type { ClientInsight, ProcessInsightsResult, ProcessRecommendation } from "@/lib/process-insights";

type InsightsView = "overview" | "processes" | "clients";

const VIEWS: { value: InsightsView; label: string }[] = [
  { value: "overview", label: "Kopsavilkums" },
  { value: "processes", label: "Procesi" },
  { value: "clients", label: "Klienti" },
];

function resolvedView(value?: string): InsightsView {
  return value === "processes" || value === "clients" ? value : "overview";
}

export function ProcessInsightsView({
  insights,
  period,
  view: requestedView,
  entriesHref,
}: {
  insights: ProcessInsightsResult;
  period: string;
  view?: string;
  entriesHref: string;
}) {
  const view = resolvedView(requestedView);

  function tabHref(nextView: InsightsView) {
    const params = new URLSearchParams();
    if (period !== "30d") params.set("period", period);
    if (nextView !== "overview") params.set("view", nextView);
    const query = params.toString();
    return query ? `?${query}` : "?";
  }

  function filteredEntriesHref(category: string, query?: string) {
    const params = new URLSearchParams({ category });
    if (query) params.set("q", query);
    return `${entriesHref}?${params.toString()}`;
  }

  function clientHref(client: ClientInsight) {
    return client.id ? `/manager/clients/${client.id}/presentation?period=${period}` : null;
  }

  function processHref(process: { key: string; categoryKey: string; label: string }) {
    return filteredEntriesHref(process.categoryKey, process.key.includes("::") ? process.label : undefined);
  }

  function recommendationEntriesHref(recommendation: ProcessRecommendation) {
    return filteredEntriesHref(
      recommendation.categoryKey,
      recommendation.processKey.includes("::") ? recommendation.processLabel : undefined,
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Procesu analīze"
        description="Kur atkārtojas darbs, kuri klienti aizņem visvairāk laika un ko iespējams uzlabot."
        actions={<PeriodTabs current={period} />}
      />

      <nav className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg bg-muted/70 p-1 dark:bg-white/[0.04]" aria-label="Analīzes sadaļas">
        {VIEWS.map((item) => (
          <Link
            key={item.value}
            href={tabHref(item.value)}
            className={cn(
              "whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors",
              view === item.value
                ? "bg-background text-foreground shadow-sm dark:bg-white/[0.1]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {view === "overview" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard
              label="Fiksētais laiks"
              value={formatDurationLV(insights.totalMinutes)}
              hint={`${insights.totalEntries} apstiprināti ieraksti`}
              icon={<Clock />}
              tone="default"
            />
            <KpiCard
              label="Atkārtojošies procesi"
              value={insights.repeatedProcessCount}
              hint={`${insights.processCoveragePercent}% no visiem ierakstiem`}
              icon={<Repeat2 />}
              tone="info"
            />
            <KpiCard
              label="Ietaupījuma potenciāls"
              value={insights.recommendations.length
                ? formatSavingRangeLV(insights.potentialSavingLowMinutes, insights.potentialSavingHighMinutes)
                : "Vēl nav datu"}
              hint={insights.recommendations.length
                ? `Tik daudz laika šajā periodā varētu atgūt, ieviešot ${insights.recommendations.length} zemāk redzamos ieteikumus`
                : "Parādīsies, tiklīdz būs pietiekami daudz atkārtotu ierakstu"}
              icon={<Sparkles />}
              tone="accent"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <section>
              <div className="mb-3">
                <h2 className="text-lg font-semibold">Ieteikumi</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ko mainīt vispirms un cik laika tas var atbrīvot
                </p>
              </div>
              <RecommendationList
                recommendations={insights.recommendations}
                entriesHref={recommendationEntriesHref}
              />
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Ieteikumi balstīti apstiprināto ierakstu biežumā, laikā un aprakstos. Tie ir sākumpunkts procesa pārbaudei, nevis automātisks lēmums.
              </p>
            </section>

            <section>
              <div className="mb-3">
                <h2 className="text-lg font-semibold">Klientu slodze</h2>
                <p className="mt-1 text-sm text-muted-foreground">Lielākie klienti pēc patērētā laika</p>
              </div>
              <ClientLoadPanel
                clients={insights.clients}
                clientHref={clientHref}
                allClientsHref={tabHref("clients")}
              />
            </section>
          </div>

          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Biežākie procesi</h2>
                <p className="mt-1 text-sm text-muted-foreground">Pirmie pieci pēc patērētā laika</p>
              </div>
              <Link href={tabHref("processes")} className="text-sm font-medium underline-offset-4 hover:underline">Skatīt visus</Link>
            </div>
            <ProcessList processes={insights.processes} href={processHref} limit={5} />
          </section>
        </>
      ) : null}

      {view === "processes" ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard
              label="Procesi periodā"
              value={insights.processes.length}
              hint={`No tiem ${insights.repeatedProcessCount} atkārtojas`}
              icon={<Repeat2 />}
              tone="info"
            />
            <KpiCard
              label="Lielākā slodze"
              value={insights.processes[0] ? formatDurationLV(insights.processes[0].minutes) : "-"}
              hint={insights.processes[0]?.label ?? "Šajā periodā nav ierakstu"}
              icon={<Clock />}
              tone="default"
            />
            <KpiCard
              label="Ietaupījuma potenciāls"
              value={insights.recommendations.length
                ? formatSavingRangeLV(insights.potentialSavingLowMinutes, insights.potentialSavingHighMinutes)
                : "Vēl nav datu"}
              hint="Cik laika var atgūt, sakārtojot šos procesus"
              icon={<Sparkles />}
              tone="accent"
            />
          </div>

          <ProcessList
            processes={insights.processes}
            href={processHref}
            title="Procesi"
            description="Josla rāda procesa laiku pret lielāko procesu periodā. Klikšķis atver attiecīgos ierakstus."
          />
        </div>
      ) : null}

      {view === "clients" ? (
        <ClientAnalytics
          clients={insights.clients}
          clientMinutes={insights.clientMinutes}
          clientEntries={insights.clientEntries}
          totalMinutes={insights.totalMinutes}
          concentrationPercent={insights.clientConcentrationPercent}
          clientHref={clientHref}
        />
      ) : null}
    </div>
  );
}
