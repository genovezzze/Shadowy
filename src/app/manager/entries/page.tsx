import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { EntryCard } from "@/components/entries/entry-card";
import { EntriesFilter } from "@/components/entries/entries-filter";
import { PendingEntriesList } from "@/components/entries/pending-entries-list";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { resolveWorkType } from "@/lib/work-type";
import { SMART_LOG_CATEGORIES } from "@/lib/smart-log";
import {
  buildEntryWhere,
  buildExportHref,
  type EntrySearchParams,
} from "@/lib/entry-filter";

export default async function ManagerEntriesPage({
  searchParams,
}: {
  searchParams: EntrySearchParams;
}) {
  const session = await requireUser(["MANAGER", "ADMIN"]);

  // Status is handled by the pending/reviewed split, so ignore it here.
  const filterParams: EntrySearchParams = { ...searchParams, status: undefined };
  const filter = buildEntryWhere(filterParams);

  // An administrator is nobody's manager of record, so scoping this page to
  // their own id would always show an empty list - they see the whole
  // organisation instead. Spread LAST so a crafted URL cannot widen it.
  const scope =
    session.role === "ADMIN"
      ? { organizationId: session.organizationId }
      : { organizationId: session.organizationId, managerId: session.userId };

  const [pending, reviewed, team, clientSource] = await Promise.all([
    prisma.invisibleWorkEntry.findMany({
      where: { ...filter, ...scope, status: { in: ["APPROVED", "PENDING"] } },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        employee: { include: { workRole: { include: { duties: true } } } },
        client: { select: { name: true } },
        helpedUser: { select: { name: true } },
      },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: { ...filter, ...scope, status: { in: ["REJECTED", "RETURNED"] } },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        employee: { include: { workRole: { include: { duties: true } } } },
        client: { select: { name: true } },
        helpedUser: { select: { name: true } },
        timeLogs: { select: { minutes: true } },
      },
    }),
    prisma.user.findMany({
      where: {
        organizationId: session.organizationId,
        role: "EMPLOYEE",
        ...(session.role === "ADMIN" ? {} : { managerId: session.userId }),
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: { ...scope, deletedAt: null },
      select: { clientId: true, clientName: true, client: { select: { name: true } } },
    }),
  ]);

  const clientOptionMap = new Map<string, string>();
  for (const e of clientSource) {
    if (e.clientId) {
      clientOptionMap.set(`id:${e.clientId}`, e.client?.name ?? e.clientName ?? e.clientId);
    } else if (e.clientName) {
      clientOptionMap.set(`name:${e.clientName}`, e.clientName);
    }
  }
  const clientOptions = Array.from(clientOptionMap.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  function getWorkType(entry: typeof pending[number]) {
    const duties = entry.employee.workRole?.duties.map((d: { text: string }) => d.text) ?? [];
    return resolveWorkType(entry.isOutsideRole, entry.category, entry.title, duties);
  }

  return (
    <>
      <PageHeader
        title="Komandas ieraksti"
        description="Izskatiet ierakstus, ko ir iesniegusi jūsu komanda. Beidzis ar lomu nozīmē, ka darbs ietilpst darbinieka oficiālajos pienākumos."
        actions={
          <Button asChild variant="outline">
            <a href={buildExportHref(searchParams)}>
              <Download className="h-4 w-4" /> Eksportēt CSV
            </a>
          </Button>
        }
      />

      <EntriesFilter
        categories={SMART_LOG_CATEGORIES.map((c) => c.label)}
        employees={team}
        clients={clientOptions}
        showStatus={false}
      />

      <section className="mb-10">
        <h2 className="text-base font-semibold mb-3">
          Jaunākie ieraksti ({pending.length})
        </h2>
        <PendingEntriesList
          entries={pending.map((e: any) => ({
            id: e.id,
            employeeId: e.employee.id,
            title: e.title,
            category: e.category,
            description: e.description,
            clientName: e.clientName ?? e.client?.name ?? null,
            workDate: e.workDate.toISOString(),
            durationMinutes: e.durationMinutes,
            status: e.status,
            employeeName: e.employee.name,
            workType: getWorkType(e),
            helpedColleague: e.helpedColleague,
            helpedName: e.helpedUser?.name ?? null,
          }))}
        />
      </section>

      <section>
        <h2 className="text-base font-semibold mb-3">Nosūtīti atpakaļ / noraidīti</h2>
        {reviewed.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title="Nav atgrieztu vai noraidītu ierakstu"
            description="Ieraksti, kurus nosūtīsiet atpakaļ vai noraidīsiet, parādīsies šeit."
          />
        ) : (
          <div className="grid gap-4">
            {reviewed.map((e) => {
              const totalMinutes = e.durationMinutes + e.timeLogs.reduce((s, l) => s + l.minutes, 0);
              return (
                <EntryCard
                  key={e.id}
                  title={e.title}
                  category={e.category}
                  description={e.description}
                  clientName={e.clientName ?? e.client?.name ?? undefined}
                  workDate={e.workDate}
                  durationMinutes={totalMinutes}
                  status={e.status}
                  employeeName={e.employee.name}
                  managerComment={e.managerComment}
                  workType={getWorkType(e)}
                  helpedColleague={e.helpedColleague}
                  helpedName={e.helpedUser?.name}
                />
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
