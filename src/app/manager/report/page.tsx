import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resolveWorkType } from "@/lib/work-type";
import { buildClientLookup, normalizeClientName } from "@/lib/client-name";
import { addMonthlyMinutes, clientMonthOptions, resolveClientMonth, sumMonthlyOverrun } from "@/lib/client-month";
import { ClientMonthSelector } from "@/components/dashboard/client-month-selector";
import { ReportPrintButton } from "@/components/report/report-print-button";
import { PeriodTabs } from "@/components/dashboard/period-tabs";
import { InvisibleWorkCostPanel } from "@/components/dashboard/invisible-work-cost-panel";
import { categoryLabel, normalizeCategoryKey } from "@/lib/work-insights";
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, Users, FileText } from "lucide-react";

function getPeriodStart(period: string): Date {
  const now = new Date();
  if (period === "7d") return new Date(now.getTime() - 7 * 86400000);
  if (period === "90d") return new Date(now.getTime() - 90 * 86400000);
  return new Date(now.getTime() - 30 * 86400000); // default 30d
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

function generateRecommendations(data: {
  teamAvgHours: number;
  overloaded: { name: string; hours: number }[];
  extraPct: number;
  noRolePct: number;
  avgReviewDays: number | null;
  zeroEntryCount: number;
  topCategory: string | null;
  topCategoryPct: number;
}) {
  const recs: { tone: "warning" | "info" | "success"; text: string }[] = [];

  if (data.overloaded.length > 0) {
    const names = data.overloaded.map((e) => e.name.split(" ")[0]).join(", ");
    recs.push({
      tone: "warning",
      text: `${names} strādā ievērojami vairāk nekā komandas vidējais (${Math.round(data.teamAvgHours * 10) / 10}h). Apsveriet slodzes pārdali.`,
    });
  }

  if (data.extraPct > 40) {
    recs.push({
      tone: "warning",
      text: `${data.extraPct}% darba ir ārpus oficiālajām lomām. Iespējams, amata apraksti neatbilst reālajai situācijai.`,
    });
  }

  if (data.noRolePct > 20) {
    recs.push({
      tone: "info",
      text: `${data.noRolePct}% ierakstu ir bez piesaistītas lomas. Pārskatiet lomu iestatījumus, lai uzlabotu klasifikāciju.`,
    });
  }

  if (data.avgReviewDays !== null && data.avgReviewDays > 3) {
    recs.push({
      tone: "warning",
      text: `Vidējais izskatīšanas laiks ir ${data.avgReviewDays} dienas. Ātrāka izskatīšana stiprina darbinieku uzticēšanos.`,
    });
  }

  if (data.zeroEntryCount > 0) {
    recs.push({
      tone: "info",
      text: `${data.zeroEntryCount} komandas locekļi šajā periodā nav iesnieguši nevienu ierakstu. Pārbaudiet, vai viņiem nav nepieciešama atbalsts.`,
    });
  }

  if (data.topCategory && data.topCategoryPct > 35) {
    recs.push({
      tone: "info",
      text: `Kategorija "${categoryLabel(data.topCategory)}" veido ${data.topCategoryPct}% no visiem ierakstiem. Apsveriet, vai šo darbu var formalizēt vai automatizēt.`,
    });
  }

  if (recs.length === 0) {
    recs.push({ tone: "success", text: "Komandas rādītāji izskatās labi. Turpiniet regulāru ierakstu izskatīšanu." });
  }

  return recs;
}

export default async function ManagerReportPage({
  searchParams,
}: {
  searchParams: { period?: string; clientMonth?: string };
}) {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  const orgId = session.organizationId;
  const managerId = session.userId;
  const period = searchParams?.period ?? "30d";
  const periodStart = getPeriodStart(period);
  const now = new Date();
  const clientMonth = resolveClientMonth(searchParams?.clientMonth, now);

  const [teamUsers, allEntries, reviewedEntries, org, clients, clientMonthEntries, clientMonthHistory] = await Promise.all([
    prisma.user.findMany({
      where: { organizationId: orgId, managerId, role: "EMPLOYEE" },
      select: { id: true, name: true, workRole: { select: { duties: { select: { text: true } } } } },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: { organizationId: orgId, managerId, createdAt: { gte: periodStart } },
      select: {
        id: true,
        title: true,
        category: true,
        clientName: true,
        clientId: true,
        durationMinutes: true,
        status: true,
        createdAt: true,
        employeeId: true,
        isOutsideRole: true,
        employee: { select: { id: true, name: true } },
      },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: { organizationId: orgId, managerId, status: { in: ["APPROVED", "REJECTED", "RETURNED"] } },
      select: { createdAt: true, updatedAt: true },
    }),
    prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } }),
    prisma.client.findMany({
      where: { organizationId: orgId, status: "active" },
      select: {
        id: true,
        name: true,
        freeMinutesPerMonth: true,
        aliases: { select: { normalized: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: {
        organizationId: orgId,
        managerId,
        status: "APPROVED",
        deletedAt: null,
        ...(clientMonth.isAll ? {} : { workDate: { gte: clientMonth.start!, lt: clientMonth.end! } }),
      },
      select: { clientId: true, clientName: true, durationMinutes: true, workDate: true },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: {
        organizationId: orgId,
        managerId,
        status: "APPROVED",
        deletedAt: null,
        OR: [{ clientId: { not: null } }, { clientName: { not: null } }],
      },
      select: { workDate: true },
    }),
  ]);

  const availableClientMonths = clientMonthOptions(
    clientMonthHistory.map((entry) => entry.workDate),
    clientMonth.key,
    now,
  );

  const approved = allEntries.filter((e) => e.status === "APPROVED");
  const pending = allEntries.filter((e) => e.status === "PENDING");

  // Work type breakdown
  const workTypeCount = { in_role: 0, extra: 0, no_role: 0 };
  for (const e of approved) {
    const emp = teamUsers.find((u) => u.id === e.employeeId);
    const duties = emp?.workRole?.duties.map((d) => d.text) ?? [];
    const wt = resolveWorkType(e.isOutsideRole, e.category, e.title, duties);
    workTypeCount[wt]++;
  }
  const totalApproved = approved.length || 1;
  const inRolePct = Math.round((workTypeCount.in_role / totalApproved) * 100);
  const extraPct = Math.round((workTypeCount.extra / totalApproved) * 100);
  const noRolePct = Math.round((workTypeCount.no_role / totalApproved) * 100);

  // Per-employee stats
  const empMap = new Map<string, { name: string; entries: number; approvedMinutes: number; extraCount: number }>();
  for (const u of teamUsers) {
    empMap.set(u.id, { name: u.name, entries: 0, approvedMinutes: 0, extraCount: 0 });
  }
  for (const e of allEntries) {
    const emp = empMap.get(e.employeeId);
    if (!emp) continue;
    emp.entries++;
    if (e.status === "APPROVED") {
      emp.approvedMinutes += e.durationMinutes;
      const duties = teamUsers.find((u) => u.id === e.employeeId)?.workRole?.duties.map((d) => d.text) ?? [];
      const wt = resolveWorkType(e.isOutsideRole, e.category, e.title, duties);
      if (wt === "extra") emp.extraCount++;
    }
  }
  const empData = Array.from(empMap.values())
    .map(({ name, entries, approvedMinutes, extraCount }) => ({
      name,
      entries,
      hours: Math.round((approvedMinutes / 60) * 10) / 10,
      extraPct: approvedMinutes > 0 ? Math.round((extraCount / Math.max(entries, 1)) * 100) : 0,
    }))
    .sort((a, b) => b.hours - a.hours);

  const teamAvgHours = empData.length > 0 ? empData.reduce((s, e) => s + e.hours, 0) / empData.length : 0;
  const overloaded = empData.filter((e) => e.hours > teamAvgHours * 1.8 && teamAvgHours > 0);
  const zeroEntryCount = empData.filter((e) => e.entries === 0).length;

  // Avg review time
  const avgReviewMs =
    reviewedEntries.length > 0
      ? reviewedEntries.reduce((s, e) => s + (e.updatedAt.getTime() - e.createdAt.getTime()), 0) / reviewedEntries.length
      : null;
  const avgReviewDays = avgReviewMs !== null ? Math.round((avgReviewMs / 86400000) * 10) / 10 : null;

  // Top categories
  const catMap = new Map<string, number>();
  for (const e of approved) {
    const key = normalizeCategoryKey(e.category);
    catMap.set(key, (catMap.get(key) ?? 0) + 1);
  }
  const topCats = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]);
  const topCategory = topCats[0]?.[0] ?? null;
  const topCategoryPct = topCats[0] ? Math.round((topCats[0][1] / totalApproved) * 100) : 0;

  // Weekly activity
  const weeklyData = buildWeeklyData(allEntries, periodStart);
  const maxWeekCount = Math.max(...weeklyData.map((w) => w.count), 1);

  // Approval rate
  const approvalRate = allEntries.length > 0 ? Math.round((approved.length / allEntries.length) * 100) : 0;

  // Total approved hours
  const totalHours = Math.round((approved.reduce((s, e) => s + e.durationMinutes, 0) / 60) * 10) / 10;

  // Client analytics
  const clientById = new Map(clients.map((c) => [c.id, c]));
  const clientByNorm = buildClientLookup(clients);
  const clientMinMap = new Map<string, number>(); // clientId → minutes
  const clientNameMinMap = new Map<string, { minutes: number; displayName: string }>(); // clientName.lower → data
  const clientMonthlyMap = new Map<string, Map<string, number>>();
  let noClientCount = 0;
  for (const e of clientMonthEntries) {
    // A free-typed name that resolves to a registered client - directly or
    // through one of its aliases - counts towards that client, not towards a
    // lookalike unregistered row sitting next to it.
    const registered = e.clientId
      ? clientById.get(e.clientId)
      : e.clientName
        ? clientByNorm.get(normalizeClientName(e.clientName))
        : undefined;

    if (registered) {
      clientMinMap.set(registered.id, (clientMinMap.get(registered.id) ?? 0) + e.durationMinutes);
      addMonthlyMinutes(clientMonthlyMap, registered.id, e.workDate, e.durationMinutes);
    } else if (e.clientId) {
      // Linked to an archived or deleted client: this report covers active
      // clients only, so it stays out of both buckets.
    } else if (e.clientName) {
      const key = normalizeClientName(e.clientName);
      const existing = clientNameMinMap.get(key);
      clientNameMinMap.set(key, { minutes: (existing?.minutes ?? 0) + e.durationMinutes, displayName: existing?.displayName ?? e.clientName });
      addMonthlyMinutes(clientMonthlyMap, `name:${key}`, e.workDate, e.durationMinutes);
    } else {
      noClientCount++;
    }
  }
  const clientData: { id: string; name: string; minutes: number; freeMinutes: number | null; overrun: number; eur: number; registered: boolean }[] = [];
  for (const c of clients) {
    const minutes = clientMinMap.get(c.id) ?? 0;
    if (minutes === 0) continue;
    const overrun = c.freeMinutesPerMonth !== null
      ? clientMonth.isAll
        ? sumMonthlyOverrun(clientMonthlyMap, [c.id], c.freeMinutesPerMonth)
        : Math.max(0, minutes - c.freeMinutesPerMonth)
      : 0;
    clientData.push({ id: c.id, name: c.name, minutes, freeMinutes: c.freeMinutesPerMonth, overrun, eur: Math.round((overrun / 60) * 20), registered: true });
  }
  for (const [nameLower, { minutes, displayName }] of clientNameMinMap.entries()) {
    clientData.push({ id: nameLower, name: displayName, minutes, freeMinutes: null, overrun: 0, eur: 0, registered: false });
  }
  clientData.sort((a, b) => b.minutes - a.minutes);

  // Hidden cost: approved extra hours (work outside role)
  let extraMinutes = 0;
  for (const e of approved) {
    const emp = teamUsers.find((u) => u.id === e.employeeId);
    const duties = emp?.workRole?.duties.map((d) => d.text) ?? [];
    if (resolveWorkType(e.isOutsideRole, e.category, e.title, duties) === "extra") {
      extraMinutes += e.durationMinutes;
    }
  }
  const extraHours = Math.round((extraMinutes / 60) * 10) / 10;

  const recommendations = generateRecommendations({
    teamAvgHours, overloaded, extraPct, noRolePct, avgReviewDays, zeroEntryCount, topCategory, topCategoryPct,
  });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Screen-only header */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pilota atskaite</h1>
          <p className="text-sm text-muted-foreground mt-2">{org?.name} · {session.name}</p>
          <p className="text-sm text-muted-foreground">
            {fmtDate(periodStart)} - {fmtDate(now)}
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
            <h1 className="text-2xl font-bold text-black">Shadowy - Pilota atskaite</h1>
            <p className="text-sm text-gray-500 mt-1">
              {org?.name} · Vadītājs: {session.name}
            </p>
            <p className="text-sm text-gray-500">
              Periods: {fmtDate(periodStart)} - {fmtDate(now)} ({getPeriodLabel(period)})
            </p>
          </div>
          <p className="text-xs text-gray-400">Ģenerēts: {fmtDate(now)}</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {[
          { label: "Komandā", value: teamUsers.length, icon: <Users className="h-4 w-4" />, sub: "darbinieki" },
          { label: "Ieraksti", value: allEntries.length, icon: <FileText className="h-4 w-4" />, sub: "iesniegti" },
          { label: "Stundas", value: `${totalHours}h`, icon: <Clock className="h-4 w-4" />, sub: "apstiprinātās" },
          { label: "Apstiprinājuma %", value: `${approvalRate}%`, icon: <CheckCircle2 className="h-4 w-4" />, sub: "no iesniegtajiem" },
          { label: "Vid. izskatīšana", value: avgReviewDays !== null ? `${avgReviewDays}d.` : "-", icon: <TrendingUp className="h-4 w-4" />, sub: "dienas" },
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

      {/* Work type breakdown */}
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          Darba veidu sadalījums
          <span className="text-xs font-normal text-muted-foreground">(apstiprinātie ieraksti)</span>
        </h2>
        <div className="rounded-xl border border-border bg-card p-5 print:border-gray-200">
          <div className="space-y-3">
            {[
              { label: "Ietilpst lomā", pct: inRolePct, count: workTypeCount.in_role, color: "bg-emerald-500", desc: "Darbs atbilst amata aprakstam" },
              { label: "Papildu ieguldījums", pct: extraPct, count: workTypeCount.extra, color: "bg-indigo-500", desc: "Darbs ārpus oficāālās lomas" },
              { label: "Bez piesaistītas lomas", pct: noRolePct, count: workTypeCount.no_role, color: "bg-gray-400", desc: "Nav piesaistīta loma" },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-40 shrink-0">
                  <div className="text-sm font-medium">{row.label}</div>
                  <div className="text-xs text-muted-foreground print:text-gray-400">{row.desc}</div>
                </div>
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
                    title={`${w.count} ieraksti`}
                  />
                </div>
                <div className="text-[9px] text-muted-foreground print:text-gray-400">{w.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Per-employee table */}
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">Komandas sniegums</h2>
        <div className="rounded-xl border border-border overflow-hidden print:border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 print:bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground print:text-gray-500">#</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground print:text-gray-500">Darbinieks</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground print:text-gray-500">Ieraksti</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground print:text-gray-500">Apst. stundas</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground print:text-gray-500">Papildu darbs</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground print:text-gray-500">Statuss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border print:divide-gray-100">
              {empData.map((emp, i) => {
                const isOverloaded = emp.hours > teamAvgHours * 1.8 && teamAvgHours > 0;
                const isInactive = emp.entries === 0;
                return (
                  <tr key={i} className="hover:bg-muted/20 transition-colors print:hover:bg-transparent">
                    <td className="px-5 py-3 text-muted-foreground print:text-gray-400">{i + 1}</td>
                    <td className="px-5 py-3 font-medium">{emp.name}</td>
                    <td className="px-4 py-3 text-center tabular-nums">{emp.entries}</td>
                    <td className="px-4 py-3 text-center tabular-nums font-semibold">{emp.hours}h</td>
                    <td className="px-4 py-3 text-center">
                      {emp.entries > 0 ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden print:bg-gray-100">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${emp.extraPct}%` }} />
                          </div>
                          <span className="text-xs tabular-nums">{emp.extraPct}%</span>
                        </div>
                      ) : <span className="text-muted-foreground print:text-gray-400">-</span>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {isInactive && (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Nav ierakstu</span>
                      )}
                      {isOverloaded && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 print:bg-amber-100 print:text-amber-700">
                          <AlertTriangle className="h-3 w-3" />Pārslodze
                        </span>
                      )}
                      {!isInactive && !isOverloaded && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 print:bg-emerald-100 print:text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" />Labi
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-muted/20 print:bg-gray-50">
                <td colSpan={3} className="px-5 py-2.5 text-xs text-muted-foreground print:text-gray-400">Vidēji uz darbinieku</td>
                <td className="px-4 py-2.5 text-center text-sm font-semibold tabular-nums">{Math.round(teamAvgHours * 10) / 10}h</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
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
                    <div className="w-4 text-xs text-muted-foreground print:text-gray-400">{i + 1}.</div>
                    <div className="w-36 text-sm truncate">{categoryLabel(cat)}</div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden print:bg-gray-100">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums w-16 text-right print:text-gray-400">
                      {count} · {pct}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Client analytics */}
      <ClientMonthSelector selectedMonth={clientMonth.key} options={availableClientMonths} />
      {(clientData.length > 0 || noClientCount > 0) && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold mb-0.5">Klienti</h2>
              <p className="text-xs text-muted-foreground">{clientMonth.label} · pārsniegums = ierakstīts − bezmaksas limits</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Stundas likme</div>
              <div className="text-sm font-semibold">€20 / h</div>
            </div>
          </div>
          <div className="rounded-xl border border-border overflow-hidden print:border-gray-200">
            {clientData.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 print:bg-gray-50">
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground print:text-gray-500">Klients</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground print:text-gray-500">Ierakstīts</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground print:text-gray-500">Bezmaksas limits</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground print:text-gray-500">Pārsniegums</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground print:text-gray-500">~EUR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border print:divide-gray-100">
                  {clientData.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/20 transition-colors print:hover:bg-transparent">
                      <td className="px-5 py-3 font-medium">
                        {c.registered ? (
                          <Link href={`/manager/clients/${c.id}`} className="hover:underline hover:text-foreground transition-colors print:no-underline">
                            {c.name}
                          </Link>
                        ) : c.name}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{`${Math.round((c.minutes / 60) * 10) / 10}h`}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground print:text-gray-400">
                        {c.registered ? (c.freeMinutes !== null ? `${Math.round((c.freeMinutes / 60) * 10) / 10}h` : "∞") : "-"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {c.registered && c.overrun > 0 ? <span className="font-semibold text-amber-500">+{Math.round((c.overrun / 60) * 10) / 10}h</span> : <span className="text-muted-foreground print:text-gray-400">-</span>}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {c.registered && c.eur > 0 ? <span className="font-semibold text-amber-500">€{c.eur}</span> : <span className="text-muted-foreground print:text-gray-400">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {noClientCount > 0 && (
              <div className={`flex items-center gap-2 px-5 py-3 text-sm text-amber-600 dark:text-amber-400 print:text-amber-700 ${clientData.length > 0 ? "border-t border-border" : ""}`}>
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {noClientCount} ierakst{noClientCount === 1 ? "s" : "i"} bez klienta.
              </div>
            )}
          </div>
        </section>
      )}

      {/* Hidden cost estimate */}
      {extraHours > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-3">Neredzamā darba novērtējums</h2>
          <InvisibleWorkCostPanel extraHours={extraHours} extraPct={extraPct} />
        </section>
      )}

      {/* Recommendations */}
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">Ieteikumi</h2>
        <div className="space-y-2">
          {recommendations.map((r, i) => (
            <div
              key={i}
              className={`flex gap-3 rounded-xl border p-4 print:border-gray-200 ${
                r.tone === "warning"
                  ? "border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-900/10"
                  : r.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-900/10"
                  : "border-border bg-card"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {r.tone === "warning" ? (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                ) : r.tone === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <p className="text-sm leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Print footer */}
      <div className="hidden print:block mt-8 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
        Shadowy · shadowy.lv · Ģenerēts {fmtDate(now)} · Konfidenciāls dokuments
      </div>
    </div>
  );
}
