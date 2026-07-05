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

  const [pending, reviewed, team, categories] = await Promise.all([
    prisma.invisibleWorkEntry.findMany({
      where: { organizationId: session.organizationId, managerId: session.userId, status: "PENDING", ...filter },
      orderBy: { createdAt: "asc" },
      include: { employee: { include: { workRole: { include: { duties: true } } } } },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: {
        organizationId: session.organizationId,
        managerId: session.userId,
        status: { in: ["APPROVED", "REJECTED", "RETURNED"] },
        ...filter,
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: { employee: { include: { workRole: { include: { duties: true } } } } },
    }),
    prisma.user.findMany({
      where: { organizationId: session.organizationId, managerId: session.userId, role: "EMPLOYEE" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.category.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { name: "asc" },
      select: { name: true },
    }),
  ]);

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
        categories={categories.map((c) => c.name)}
        employees={team}
        showStatus={false}
      />

      <section className="mb-10">
        <h2 className="text-base font-semibold mb-3">
          Gaida izskatīšanu ({pending.length})
        </h2>
        <PendingEntriesList
          entries={pending.map((e: any) => ({
            id: e.id,
            employeeId: e.employee.id,
            title: e.title,
            category: e.category,
            description: e.description,
            clientName: e.clientName,
            workDate: e.workDate.toISOString(),
            durationMinutes: e.durationMinutes,
            status: e.status,
            employeeName: e.employee.name,
            workType: getWorkType(e),
          }))}
        />
      </section>

      <section>
        <h2 className="text-base font-semibold mb-3">Jau izskatītie</h2>
        {reviewed.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title="Vēl nav izskatītu ierakstu"
            description="Apstiprinātie, noraidītie un atpakaļ nosūtītie ieraksti parādīsies šeit."
          />
        ) : (
          <div className="grid gap-4">
            {reviewed.map((e: typeof reviewed[number]) => (
              <EntryCard
                key={e.id}
                title={e.title}
                category={e.category}
                description={e.description}
                clientName={e.clientName}
                workDate={e.workDate}
                durationMinutes={e.durationMinutes}
                status={e.status}
                employeeName={e.employee.name}
                managerComment={e.managerComment}
                workType={getWorkType(e)}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
