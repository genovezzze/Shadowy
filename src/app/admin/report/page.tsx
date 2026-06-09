import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { classifyWorkType } from "@/lib/work-type";
import { ReportPrintButton } from "@/components/report/report-print-button";
import { PeriodTabs } from "@/components/dashboard/period-tabs";
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, Users, FileText, UserCog } from "lucide-react";

function getPeriodStart(period: string): Date {
  const now = new Date();
  if (period === "7d") return new Date(now.getTime() - 7 * 86400000);
  if (period === "90d") return new Date(now.getTime() - 90 * 86400000);
  return new Date(now.getTime() - 30 * 86400000);
}

function getPeriodLabel(period: string) {
  if (period === "7d") return "7 dienas";
  if (period === "90d") return "90 dienas";
  return "30 dienas";
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("lv-LV", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function buildWeeklyData(entries: { createdAt: Date }[], from: Date) {
  const weeks: { label: string; count: number }[] = [];
  const now = new Date();
  let cursor = new Date(from);
  while (cursor < now) {
    const end = new Date(Math.min(cursor.getTime() + 7 * 86400000, now.getTime()));
    const count = entries.filter((e) => e.createdAt >= cursor && e.createdAt < end).length;
    weeks.push({ label: `${cursor.getDate().toString().padStart(2, "0")}.${(cursor.getMonth() + 1).toString().padStart(2, "0")}`, count });
    cursor = end;
  }
  return weeks;
}

export default async function AdminReportPage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const session = await requireUser(["ADMIN"]);
  const orgId = session.organizationId;
  const period = searchParams?.period ?? "30d";
  const periodStart = getPeriodStart(period);
  const now = new Date();

  const [org, employees, managers, allEntries, reviewedAll] = await Promise.all([
    prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } }),
    prisma.user.findMany({
      where: { organizationId: orgId, role: "EMPLOYEE" },
      select: { id: true, name: true, managerId: true, workRole: { select: { duties: { select: { text: true } } } } },
    }),
    prisma.user.findMany({
      where: { organizationId: orgId, role: "MANAGER" },
      select: { id: true, name: true },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: { organizationId: orgId, createdAt: { gte: periodStart } },
      select: {
        id: true, title: true, category: true, durationMinutes: true,
        status: true, createdAt: true, employeeId: true, managerId: true,
      },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: { organizationId: orgId, status: { in: ["APPROVED", "REJECTED", "RETURNED"] } },
      select: { managerId: true, createdAt: true, updatedAt: true },
    }),
  ]);

  const approved = allEntries.filter((e) => e.status === "APPROVED");
  const totalApproved = approved.length || 1;
  const approvalRate = allEntries.length > 0 ? Math.round((approved.length / allEntries.length) * 100) : 0;
  const totalHours = Math.round((approved.reduce((s, e) => s + e.durationMinutes, 0) / 60) * 10) / 10;

  // Work type breakdown
  const workTypeCount = { in_role: 0, extra: 0, no_role: 0 };
  for (const e of approved) {
    const emp = employees.find((u) => u.id === e.employeeId);
    const duties = emp?.workRole?.duties.map((d) => d.text) ?? [];
    const wt = classifyWorkType(e.category, e.title, duties);
    workTypeCount[wt]++;
  }
  const inRolePct = Math.round((workTypeCount.in_role / totalApproved) * 100);
  const extraPct = Math.round((workTypeCount.extra / totalApproved) * 100);
  const noRolePct = Math.round((workTypeCount.no_role / totalApproved) * 100);

  // Per-manager stats
  const mgrData = managers.map((m) => {
    const teamSize = employees.filter((e) => e.managerId === m.id).length;
    const mgrEntries = allEntries.filter((e) => e.managerId === m.id);
    const mgrApproved = mgrEntries.filter((e) => e.status === "APPROVED");
    const mgrHours = Math.round((mgrApproved.reduce((s, e) => s + e.durationMinutes, 0) / 60) * 10) / 10;
    const reviewed = reviewedAll.filter((e) => e.managerId === m.id);
    const avgMs = reviewed.length > 0
      ? reviewed.reduce((s, e) => s + (e.updatedAt.getTime() - e.createdAt.getTime()), 0) / reviewed.length
      : null;
    const avgDays = avgMs !== null ? Math.round((avgMs / 86400000) * 10) / 10 : null;
    const pendingCount = mgrEntries.filter((e) => e.status === "PENDING").length;
    return { name: m.name, teamSize, entries: mgrEntries.length, hours: mgrHours, avgDays, pending: pendingCount };
  }).sort((a, b) => b.hours - a.hours);

  // Top categories
  const catMap = new Map<string, number>();
  for (const e of approved) catMap.set(e.category, (catMap.get(e.category) ?? 0) + 1);
  const topCats = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Weekly activity
  const weeklyData = buildWeeklyData(allEntries, periodStart);
  const maxWeekCount = Math.max(...weeklyData.map((w) => w.count), 1);

  // Org avg review
  const avgMs = reviewedAll.length > 0
    ? reviewedAll.reduce((s, e) => s + (e.updatedAt.getTime() - e.createdAt.getTime()), 0) / reviewedAll.length
    : null;
  const avgReviewDays = avgMs !== null ? Math.round((avgMs / 86400000) * 10) / 10 : null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Screen header */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">Pilota atskaite</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {org?.name} · {fmtDate(periodStart)} – {fmtDate(now)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PeriodTabs current={period} />
          <ReportPrintButton />
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-8">
        <div className="flex items-start justify-between border-b pb-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-black">Shadowy — Pilota atskaite</h1>
            <p className="text-sm text-gray-500 mt-1">{org?.name}</p>
            <p className="text-sm text-gray-500">
              Periods: {fmtDate(periodStart)} – {fmtDate(now)} ({getPeriodLabel(period)})
            </p>
          </div>
          <p className="text-xs text-gray-400">Ģenerēts: {fmtDate(now)}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {[
          { label: "Vadītāji", value: managers.length, icon: <UserCog className="h-4 w-4" />, sub: "aktīvi" },
          { label: "Darbinieki", value: employees.length, icon: <Users className="h-4 w-4" />, sub: "kopā" },
          { label: "Ieraksti", value: allEntries.length, icon: <FileText className="h-4 w-4" />, sub: "periodā" },
          { label: "Stundas", value: `${totalHours}h`, icon: <Clock className="h-4 w-4" />, sub: "apstiprinātās" },
          { label: "Vid. izskatīšana", value: avgReviewDays !== null ? `${avgReviewDays}d.` : "—", icon: <TrendingUp className="h-4 w-4" />, sub: "dienas" },
        ].map((k, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 print:border-gray-200">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1 print:text-gray-500">
              {k.icon}
              <span className="text-xs">{k.label}</span>
            </div>
            <div className="text-2xl font-bold tabular-nums">{k.value}</div>
            <div className="text-xs text-muted-foreground print:text-gray-400">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Work type */}
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">Darba veidu sadalījums</h2>
        <div className="rounded-xl border border-border bg-card p-5 print:border-gray-200">
          <div className="space-y-3">
            {[
              { label: "Ietilpst lomā", pct: inRolePct, count: workTypeCount.in_role, color: "bg-emerald-500" },
              { label: "Papildu ieguldījums", pct: extraPct, count: workTypeCount.extra, color: "bg-indigo-500" },
              { label: "Bez piesaistītas lomas", pct: noRolePct, count: workTypeCount.no_role, color: "bg-gray-400" },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-44 text-sm shrink-0">{row.label}</div>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden print:bg-gray-100">
                  <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.pct}%` }} />
                </div>
                <div className="w-20 text-right text-sm tabular-nums">
                  <span className="font-semibold">{row.pct}%</span>
                  <span className="text-muted-foreground print:text-gray-400 ml-1">({row.count})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly activity */}
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">Iknedēļas aktivitāte</h2>
        <div className="rounded-xl border border-border bg-card p-5 print:border-gray-200">
          <div className="flex items-end gap-2" style={{ height: "80px" }}>
            {weeklyData.map((w, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end" style={{ height: "56px" }}>
                  <div
                    className="w-full rounded-t bg-emerald-500/70 print:bg-emerald-600"
                    style={{ height: `${Math.max((w.count / maxWeekCount) * 100, w.count > 0 ? 8 : 0)}%` }}
                  />
                </div>
                <div className="text-[9px] text-muted-foreground print:text-gray-400">{w.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Per-manager table */}
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">Vadītāju sniegums</h2>
        <div className="rounded-xl border border-border overflow-hidden print:border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 print:bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Vadītājs</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Komanda</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Ieraksti</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Apst. stundas</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Gaida</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Vid. izskatīšana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border print:divide-gray-100">
              {mgrData.map((m, i) => (
                <tr key={i} className="hover:bg-muted/20 print:hover:bg-transparent transition-colors">
                  <td className="px-5 py-3 font-medium">{m.name}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground tabular-nums">{m.teamSize}</td>
                  <td className="px-4 py-3 text-center tabular-nums">{m.entries}</td>
                  <td className="px-4 py-3 text-center font-semibold tabular-nums">{m.hours}h</td>
                  <td className="px-4 py-3 text-center">
                    {m.pending > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-warning/10 text-warning px-2 py-0.5 text-xs font-medium">{m.pending}</span>
                    ) : <span className="text-muted-foreground">0</span>}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {m.avgDays !== null ? (
                      <span className={m.avgDays <= 1 ? "text-success font-medium tabular-nums" : m.avgDays <= 3 ? "tabular-nums" : "text-warning font-medium tabular-nums"}>
                        {m.avgDays} d.
                      </span>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top categories */}
      {topCats.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-3">Populārākās kategorijas</h2>
          <div className="rounded-xl border border-border bg-card p-5 print:border-gray-200">
            <div className="space-y-3">
              {topCats.map(([cat, count], i) => {
                const pct = Math.round((count / totalApproved) * 100);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 text-xs text-muted-foreground">{i + 1}.</div>
                    <div className="w-36 text-sm truncate">{cat}</div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden print:bg-gray-100">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums w-16 text-right">{count} · {pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <div className="hidden print:block mt-8 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
        Shadowy · shadowy.lv · Ģenerēts {fmtDate(now)} · Konfidenciāls dokuments
      </div>
    </div>
  );
}
