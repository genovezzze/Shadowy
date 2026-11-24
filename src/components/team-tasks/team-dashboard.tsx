"use client";

import { useState } from "react";
import Link from "next/link";
import type { TaskStatus } from "@prisma/client";
import { AlertCircle, CalendarClock, Check, ChevronDown, CircleCheck, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import { METRIC_SURFACE, APPLE_FILL } from "@/components/dashboard/apple";
import type { AttentionItem, LoadItem, TeamDashboard as DashboardData } from "@/lib/team-tasks-board";

/**
 * The manager's overview of the month: four headline numbers, then who carries
 * what, which reports lag, what is coming up and what is late - grouped, not a
 * wall of rows. People are listed alphabetically and drawn in one neutral
 * colour: this shows where help is needed, it is not a ranking.
 */

const LATE = "text-[#D70015] dark:text-[#FF6961]";

function dm(iso: string): string {
  return `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;
}

function weekday(iso: string): string {
  const day = new Intl.DateTimeFormat("lv-LV", { weekday: "short", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
  return day.replace(/\.$/, "");
}

function pct(done: number, total: number): number {
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

/** Thin single-colour progress bar; the numbers next to it carry the meaning. */
function Bar({ done, total, label }: { done: number; total: number; label: string }) {
  const value = pct(done, total);
  return (
    <div
      className={cn(APPLE_FILL, "h-1.5 w-full overflow-hidden rounded-full")}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      title={`${label}: ${done} no ${total} (${value}%)`}
    >
      <div className="h-full rounded-full bg-[#007AFF] dark:bg-[#0A84FF]" style={{ width: `${value}%` }} />
    </div>
  );
}

function Tile({
  icon,
  label,
  value,
  sub,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn(METRIC_SURFACE, "flex flex-col gap-1 p-4")}>
      <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="font-display text-[28px] font-medium leading-tight tabular-nums">{value}</div>
      {sub && <div className="text-[12px] text-muted-foreground">{sub}</div>}
      {children}
    </div>
  );
}

function Card({ title, note, children, className }: { title: string; note?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn(METRIC_SURFACE, "p-4", className)}>
      <div className="font-display text-[15px] font-medium">{title}</div>
      {note && <p className="mt-0.5 text-[12px] text-muted-foreground">{note}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function TeamDashboard({
  dashboard,
  totals,
  load,
  period,
  doneIds,
  onDone,
}: {
  dashboard: DashboardData;
  totals: { all: number; done: number };
  load: LoadItem[];
  period: string;
  /** Tasks ticked on this page since it loaded, so lists update at once. */
  doneIds: Set<string>;
  onDone: (item: { taskId: string; status: TaskStatus }) => void;
}) {
  const next = dashboard.upcoming[0];
  const people = load.filter((p) => p.open + p.done + p.overdue > 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Tile
          icon={<CircleCheck className="h-4 w-4" />}
          label="Pabeigts šomēnes"
          value={`${pct(totals.done, totals.all)}%`}
          sub={`${totals.done} no ${totals.all} atskaitēm`}
        >
          <div className="mt-1.5">
            <Bar done={totals.done} total={totals.all} label="Pabeigts šomēnes" />
          </div>
        </Tile>
        <Tile
          icon={<AlertCircle className={cn("h-4 w-4", dashboard.overdueTotal > 0 && LATE)} />}
          label="Nokavētās atskaites"
          value={<span className={cn(dashboard.overdueTotal > 0 && LATE)}>{dashboard.overdueTotal}</span>}
          sub={dashboard.overdueTotal > 0 ? `Vecākais ${dashboard.oldestLateDays} d. pāri termiņam` : "Nekas nav nokavēts"}
        />
        <Tile
          icon={<CalendarClock className="h-4 w-4" />}
          label="Termiņš 7 dienās"
          value={dashboard.dueThisWeek}
          sub={next ? `Tuvākais ${weekday(next.date)} ${dm(next.date)}: ${next.count}` : "Nav tuvāko termiņu"}
        />
        <Tile
          icon={<UserX className="h-4 w-4" />}
          label="Bez atbildīgā"
          value={dashboard.unassigned}
          sub={
            dashboard.unassigned > 0 ? (
              <Link href="/manager/clients" className="underline underline-offset-4">
                Piesaistīt darbiniekus klientiem
              </Link>
            ) : (
              "Visiem uzdevumiem ir atbildīgais"
            )
          }
        />
      </div>

      {/* Two independent columns, so a short card never leaves a hole beside a tall one. */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Card title="Komanda" note="Kur vajag palīdzību vai pārdalīt darbu. Nav salīdzinājums starp kolēģiem.">
            {people.length === 0 ? (
              <p className="text-sm text-muted-foreground">Šomēnes vēl nav uzdevumu.</p>
            ) : (
              <ul className="space-y-3">
                {people.map((p) => (
                  <li key={p.userId ?? "none"}>
                    <div className="mb-1 flex items-baseline justify-between gap-3 text-[14px]">
                      {p.userId ? (
                        <Link
                          href={`/manager/uzdevumi?m=${period}&darbinieks=${p.userId}`}
                          className="truncate font-medium hover:underline"
                          title="Rādīt tikai šo darbinieku"
                        >
                          {p.name}
                        </Link>
                      ) : (
                        <span className="truncate font-medium text-muted-foreground">{p.name}</span>
                      )}
                      <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground">
                        {p.done} no {p.open + p.done}
                        {p.overdue > 0 && (
                          <span className={cn("ml-2 inline-flex items-center gap-1", LATE)}>
                            <AlertCircle className="h-3 w-3" aria-hidden />
                            {p.overdue} nokavēti
                          </span>
                        )}
                      </span>
                    </div>
                    <Bar done={p.done} total={p.open + p.done} label={p.name} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="flex-1" title="Tuvākie termiņi" note="Nākamās 2 nedēļas, vēl nepabeigtās atskaites.">
            {dashboard.upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nākamajās 2 nedēļās termiņu nav.</p>
            ) : (
              <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                {dashboard.upcoming.map((g) => (
                  <li key={g.date} className="flex items-start gap-3 py-2">
                    <div className="w-16 shrink-0">
                      <div className="text-[14px] font-medium tabular-nums">{dm(g.date)}</div>
                      <div className="text-[12px] capitalize text-muted-foreground">{weekday(g.date)}</div>
                    </div>
                    <div className="min-w-0 flex-1 text-[13px] text-muted-foreground">
                      {g.reports.slice(0, 4).map((r) => `${r.name} ${r.count}`).join(" · ")}
                      {g.reports.length > 4 && ` · +${g.reports.length - 4}`}
                    </div>
                    <div className="shrink-0 text-[14px] font-medium tabular-nums">{g.count}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <div className="flex flex-col gap-4">
          <Card title="Pa atskaitēm" note="Vispirms tās, kas atpaliek visvairāk.">
            {dashboard.byColumn.length === 0 ? (
              <p className="text-sm text-muted-foreground">Šomēnes vēl nav atskaišu.</p>
            ) : (
              <ReportRows columns={dashboard.byColumn} />
            )}
          </Card>
          <Card className="flex-1" title="Nokavētās atskaites pa darbiniekiem" note="Atveriet, lai redzētu konkrētās atskaites.">
            {dashboard.overdueByPerson.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nekas nav nokavēts.</p>
            ) : (
              <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                {dashboard.overdueByPerson.map((group) => (
                  <OverdueGroup key={group.userId ?? "none"} group={group} doneIds={doneIds} onDone={onDone} />
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function OverdueGroup({
  group,
  doneIds,
  onDone,
}: {
  group: { userId: string | null; name: string; items: AttentionItem[] };
  doneIds: Set<string>;
  onDone: (item: { taskId: string; status: TaskStatus }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [all, setAll] = useState(false);
  const items = group.items.filter((i) => !doneIds.has(i.taskId));
  if (items.length === 0) return null;
  const shown = all ? items : items.slice(0, 8);

  return (
    <li className="py-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 py-1.5 text-left text-[14px]"
      >
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        <span className="flex-1 truncate font-medium">{group.name}</span>
        <span className={cn("inline-flex items-center gap-1 text-[13px] tabular-nums", LATE)}>
          <AlertCircle className="h-3.5 w-3.5" aria-hidden />
          {items.length}
        </span>
      </button>
      {open && (
        <ul className="mb-2 ml-6 space-y-1">
          {shown.map((item) => (
            <li key={item.taskId} className="flex items-center gap-2 text-[13px]">
              <button
                type="button"
                onClick={() => onDone(item)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-black/[0.15] text-transparent hover:border-foreground hover:text-foreground dark:border-white/[0.2]"
                aria-label={`Atzīmēt kā pabeigtu: ${item.clientName} ${item.reportName}`}
                title="Atzīmēt kā pabeigtu"
              >
                <Check className="h-3 w-3" />
              </button>
              <span className="min-w-0 flex-1 truncate">
                {item.clientName} <span className="text-muted-foreground">· {item.reportName}</span>
              </span>
              <span className={cn("shrink-0 tabular-nums", LATE)}>
                {dm(item.dueDate)} · {item.daysLate} d.
              </span>
            </li>
          ))}
          {items.length > 8 && (
            <li>
              <button
                type="button"
                onClick={() => setAll((v) => !v)}
                className="text-[12px] text-muted-foreground underline-offset-4 hover:underline"
              >
                {all ? "Rādīt mazāk" : `Rādīt visus (${items.length})`}
              </button>
            </li>
          )}
        </ul>
      )}
    </li>
  );
}

const REPORT_ROWS_SHOWN = 6;

/**
 * One compact line per report - name, bar, numbers - lagging ones first, so the
 * card answers "which reports are behind" without a long scroll.
 */
function ReportRows({ columns }: { columns: DashboardData["byColumn"] }) {
  const [all, setAll] = useState(false);
  const sorted = [...columns].sort(
    (a, b) =>
      b.overdue / Math.max(b.total, 1) - a.overdue / Math.max(a.total, 1) ||
      a.done / Math.max(a.total, 1) - b.done / Math.max(b.total, 1),
  );
  const shown = all ? sorted : sorted.slice(0, REPORT_ROWS_SHOWN);

  return (
    <>
      <ul className="space-y-1.5">
        {shown.map((c) => (
          <li key={c.name} className="grid grid-cols-[minmax(0,7.5rem)_1fr_auto] items-center gap-3 text-[13px]">
            <span className="truncate" title={c.name}>
              {c.name}
            </span>
            <Bar done={c.done} total={c.total} label={c.name} />
            <span className="w-24 text-right tabular-nums text-muted-foreground">
              {c.done}/{c.total}
              {c.overdue > 0 && (
                <span className={cn("ml-1.5 inline-flex items-center gap-0.5", LATE)} title={`${c.overdue} nokavēti`}>
                  <AlertCircle className="h-3 w-3" aria-hidden />
                  {c.overdue}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      {sorted.length > REPORT_ROWS_SHOWN && (
        <button
          type="button"
          onClick={() => setAll((v) => !v)}
          className="mt-2 text-[12px] text-muted-foreground underline-offset-4 hover:underline"
        >
          {all ? "Rādīt mazāk" : `Rādīt visas (${sorted.length})`}
        </button>
      )}
    </>
  );
}
