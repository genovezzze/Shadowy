import Link from "next/link";
import { ChevronRight, Building2, Layers, TrendingUp, Users } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import {
  CardHeading,
  InsightEmpty,
  RankBadge,
  SIGNIFICANT_TREND,
  ShareBar,
  Sparkline,
  TrendChip,
  rankTone,
} from "@/components/insights/insight-primitives";
import { cn, formatDurationLV } from "@/lib/utils";
import type { ClientInsight } from "@/lib/process-insights";

function ClientRow({
  client,
  index,
  maxMinutes,
  href,
}: {
  client: ClientInsight;
  index: number;
  maxMinutes: number;
  href: string | null;
}) {
  const tone = rankTone(index);
  const content = (
    <div className="flex items-start gap-3 sm:gap-4">
      <RankBadge index={index} className="mt-0.5" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="truncate text-sm font-semibold sm:text-base">{client.name}</span>
          <span className="flex shrink-0 items-baseline gap-2">
            <span className="text-base font-semibold tabular-nums sm:text-lg">{formatDurationLV(client.minutes)}</span>
            <span className="text-xs tabular-nums text-muted-foreground">{client.clientSharePercent}%</span>
          </span>
        </div>

        <div className="mt-2">
          <ShareBar value={client.minutes} max={maxMinutes} tone={tone.bar} />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          <TrendChip percent={client.trendPercent} showLabel />
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <span className={cn("size-1.5 shrink-0 rounded-full", tone.dot)} />
            <span className="truncate">
              {client.topProcess}
              {client.processes[0] ? ` · ${client.processes[0].sharePercent}%` : ""}
            </span>
          </span>
          <span className="tabular-nums">{client.count} ieraksti</span>
          <span className="tabular-nums">{client.employeeCount} darbinieki</span>
          <span className="tabular-nums">vidēji {formatDurationLV(client.averageMinutes)}</span>
        </div>
      </div>

      <Sparkline points={client.trendPoints} tone={tone.bar} className="hidden shrink-0 lg:flex" />
      {href ? <ChevronRight className="mt-1 hidden size-4 shrink-0 text-muted-foreground sm:block" /> : null}
    </div>
  );

  if (!href) return <div className="px-4 py-4 sm:px-6">{content}</div>;
  return (
    <Link href={href} className="block px-4 py-4 transition-colors hover:bg-muted/40 sm:px-6 dark:hover:bg-white/[0.03]">
      {content}
    </Link>
  );
}

/** Compact top-5 list used on the overview tab. */
export function ClientLoadPanel({
  clients,
  clientHref,
  allClientsHref,
}: {
  clients: ClientInsight[];
  clientHref: (client: ClientInsight) => string | null;
  allClientsHref: string;
}) {
  const top = clients.slice(0, 5);
  const maxMinutes = top[0]?.minutes ?? 1;

  return (
    <Card className="overflow-hidden">
      {top.length ? (
        <div className="divide-y divide-border dark:divide-white/[0.07]">
          {top.map((client, index) => {
            const tone = rankTone(index);
            const href = clientHref(client);
            const body = (
              <>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-semibold">{client.name}</span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">{formatDurationLV(client.minutes)}</span>
                </div>
                <div className="mt-2">
                  <ShareBar value={client.minutes} max={maxMinutes} tone={tone.bar} />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{client.topProcess}</span>
                  <TrendChip percent={client.trendPercent} className="shrink-0" />
                </div>
              </>
            );
            return href ? (
              <Link key={client.key} href={href} className="block px-5 py-4 transition-colors hover:bg-muted/40 dark:hover:bg-white/[0.03]">
                {body}
              </Link>
            ) : (
              <div key={client.key} className="px-5 py-4">{body}</div>
            );
          })}
          <Link href={allClientsHref} className="flex items-center justify-between px-5 py-4 text-sm font-medium transition-colors hover:bg-muted/40 dark:hover:bg-white/[0.03]">
            Visi klienti <ChevronRight className="size-4" />
          </Link>
        </div>
      ) : (
        <InsightEmpty>Šajā periodā reģistrētu klientu dati nav fiksēti.</InsightEmpty>
      )}
    </Card>
  );
}

export function ClientAnalytics({
  clients,
  clientMinutes,
  clientEntries,
  totalMinutes,
  concentrationPercent,
  clientHref,
}: {
  clients: ClientInsight[];
  clientMinutes: number;
  clientEntries: number;
  totalMinutes: number;
  concentrationPercent: number;
  clientHref: (client: ClientInsight) => string | null;
}) {
  if (!clients.length) {
    return (
      <Card className="overflow-hidden">
        <InsightEmpty>Šajā periodā reģistrētiem klientiem nav apstiprinātu ierakstu.</InsightEmpty>
      </Card>
    );
  }

  const maxMinutes = clients[0].minutes;
  const averagePerClient = Math.round(clientMinutes / clients.length);
  const clientTimeShare = totalMinutes > 0 ? Math.round((clientMinutes / totalMinutes) * 100) : 0;

  const comparable = clients.filter((client) => client.trendPercent !== null);
  const rising = comparable.filter((client) => (client.trendPercent ?? 0) >= SIGNIFICANT_TREND);
  const changed = [...comparable]
    .sort((a, b) => Math.abs(b.trendPercent ?? 0) - Math.abs(a.trendPercent ?? 0))
    .filter((client) => Math.abs(client.trendPercent ?? 0) >= SIGNIFICANT_TREND)
    .slice(0, 5);

  const causeTotals = new Map<string, { label: string; minutes: number; clients: number }>();
  for (const client of clients) {
    for (const cause of client.causes) {
      const current = causeTotals.get(cause.key) ?? { label: cause.label, minutes: 0, clients: 0 };
      current.minutes += cause.minutes;
      current.clients += 1;
      causeTotals.set(cause.key, current);
    }
  }
  const causes = [...causeTotals.values()].sort((a, b) => b.minutes - a.minutes).slice(0, 5);
  const maxCauseMinutes = causes[0]?.minutes ?? 1;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Klientu laiks"
          value={formatDurationLV(clientMinutes)}
          hint={`${clientTimeShare}% no visa fiksētā laika · ${clientEntries} ieraksti`}
          icon={<Layers />}
          tone="default"
        />
        <KpiCard
          label="Aktīvie klienti"
          value={clients.length}
          hint={`Vidēji ${formatDurationLV(averagePerClient)} uz klientu`}
          icon={<Building2 />}
          tone="info"
        />
        <KpiCard
          label="Top 3 klienti"
          value={`${concentrationPercent}%`}
          hint="No visa klientiem veltītā laika"
          icon={<Users />}
          tone="accent"
        />
        <KpiCard
          label="Slodze aug"
          value={comparable.length ? rising.length : "-"}
          hint={comparable.length
            ? `Klienti ar +${SIGNIFICANT_TREND}% vai vairāk pret iepriekšējo periodu`
            : "Šim periodam nav salīdzinājuma"}
          icon={<TrendingUp />}
          tone="warning"
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeading
          title="Klientu slodze"
          description="Katra klienta laiks pret lielāko klientu periodā. Stabiņi labajā pusē rāda, kā slodze sadalījusies periodā."
        />
        <div className="divide-y divide-border dark:divide-white/[0.07]">
          {clients.map((client, index) => (
            <ClientRow
              key={client.key}
              client={client}
              index={index}
              maxMinutes={maxMinutes}
              href={clientHref(client)}
            />
          ))}
        </div>
      </Card>

      <div className={cn("grid gap-6", changed.length ? "lg:grid-cols-2" : "")}>
        {changed.length ? (
          <Card className="overflow-hidden">
            <CardHeading title="Kur slodze mainās" description="Lielākās izmaiņas pret iepriekšējo tikpat garo periodu" />
            <div className="divide-y divide-border dark:divide-white/[0.07]">
              {changed.map((client) => {
                const delta = client.minutes - client.previousMinutes;
                return (
                  <div key={client.key} className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{client.name}</div>
                      <div className="mt-1 text-xs tabular-nums text-muted-foreground">
                        {formatDurationLV(client.previousMinutes)} → {formatDurationLV(client.minutes)}
                        {" · "}
                        {delta > 0 ? "+" : "−"}{formatDurationLV(Math.abs(delta))}
                      </div>
                    </div>
                    <TrendChip percent={client.trendPercent} />
                  </div>
                );
              })}
            </div>
          </Card>
        ) : null}

        <Card className="overflow-hidden">
          <CardHeading title="Kas rada klientu darbu" description="Biežākie iemesli klientu ierakstos" />
          {causes.length ? (
            <div className="space-y-4 px-4 py-5 sm:px-6">
              {causes.map((cause) => (
                <div key={cause.label}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate font-medium">{cause.label}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">{formatDurationLV(cause.minutes)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted dark:bg-white/[0.07]" aria-hidden>
                    <div
                      className="h-full rounded-full bg-amber-500 dark:bg-amber-400"
                      style={{ width: `${Math.max(3, (cause.minutes / maxCauseMinutes) * 100)}%` }}
                    />
                  </div>
                  <div className="mt-1.5 text-xs text-muted-foreground">Pamanīts {cause.clients} klientu ierakstos</div>
                </div>
              ))}
            </div>
          ) : (
            <InsightEmpty>Klientu aprakstos vēl nav pietiekami daudz signālu.</InsightEmpty>
          )}
        </Card>
      </div>
    </div>
  );
}
