import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { EntryCard } from "@/components/entries/entry-card";
import { EntriesFilter } from "@/components/entries/entries-filter";
import { Pagination } from "@/components/entries/pagination";
import { EmployeeEntryActions } from "@/components/entries/employee-entry-actions";
import { AddTimeButton } from "@/components/entries/add-time-button";
import { EditEntryButton } from "@/components/entries/edit-entry-button";
import { DeleteEntryButton } from "@/components/entries/delete-entry-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { resolveWorkType } from "@/lib/work-type";
import { SMART_LOG_CATEGORIES } from "@/lib/smart-log";
import { Download } from "lucide-react";
import {
  buildEntryWhere,
  buildExportHref,
  hasActiveFilters,
  parsePage,
  PAGE_SIZE,
  type EntrySearchParams,
} from "@/lib/entry-filter";

export default async function EmployeeHistoryPage({
  searchParams,
}: {
  searchParams: EntrySearchParams & { page?: string };
}) {
  const session = await requireUser(["EMPLOYEE"]);
  const where = { employeeId: session.userId, ...buildEntryWhere(searchParams) };

  const [total, user, clientSource] = await Promise.all([
    prisma.invisibleWorkEntry.count({ where }),
    prisma.user.findUnique({
      where: { id: session.userId },
      include: { workRole: { include: { duties: true } } },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: { employeeId: session.userId, deletedAt: null },
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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(parsePage(searchParams.page), totalPages);

  const entries = await prisma.invisibleWorkEntry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true, title: true, category: true, description: true,
      clientName: true, clientId: true,
      client: { select: { name: true } },
      workDate: true, durationMinutes: true, status: true,
      managerComment: true, isOutsideRole: true,
      timeLogs: { select: { minutes: true } },
    },
  });

  const duties = user?.workRole?.duties.map((d: { text: string }) => d.text) ?? [];
  const filtered = hasActiveFilters(searchParams);

  return (
    <>
      <PageHeader
        title="Mana vēsture"
        description="Visi jūsu iesniegtie neredzamā darba ieraksti un to statuss."
        actions={
          <>
            <Button asChild variant="outline">
              <a href={buildExportHref(searchParams)}>
                <Download className="h-4 w-4" /> Eksportēt CSV
              </a>
            </Button>
            <Button asChild className="!min-h-10 !rounded-[10px]">
              <Link href="/employee/new-entry">Jauns ieraksts</Link>
            </Button>
          </>
        }
      />

      {entries.length > 0 || filtered ? (
        <EntriesFilter categories={SMART_LOG_CATEGORIES.map((c) => c.label)} clients={clientOptions} />
      ) : null}

      {entries.length === 0 ? (
        filtered ? (
          <EmptyState
            title="Nav atrasts neviens ieraksts"
            description="Mēģiniet mainīt vai notīrīt filtrus."
          />
        ) : (
          <EmptyState
            title="Vēl nav iesniegtu ierakstu"
            description="Iesāciet, izveidojot pirmo ierakstu."
            action={
              <Button asChild>
                <Link href="/employee/new-entry">Iesniegt pirmo ierakstu</Link>
              </Button>
            }
          />
        )
      ) : (
        <div className="grid gap-4">
          {entries.map((e) => {
            const totalMinutes = e.durationMinutes + e.timeLogs.reduce((s, l) => s + l.minutes, 0);
            return (
              <EntryCard
                key={e.id}
                title={e.title}
                category={e.category}
                description={e.description}
                clientName={e.clientName ?? e.client?.name ?? undefined}
                clientHref={e.clientId ? `/employee/clients/${e.clientId}` : undefined}
                workDate={e.workDate}
                durationMinutes={totalMinutes}
                status={e.status}
                managerComment={e.managerComment}
                workType={resolveWorkType(e.isOutsideRole, e.category, e.title, duties)}
                footer={
                  e.status === "PENDING" || e.status === "RETURNED" ? (
                    <EmployeeEntryActions
                      entryId={e.id}
                      title={e.title}
                      category={e.category}
                      description={e.description}
                      workDate={e.workDate.toISOString().slice(0, 10)}
                      durationMinutes={e.durationMinutes}
                    />
                  ) : e.status === "APPROVED" ? (
                    <div className="flex items-center gap-2">
                      <AddTimeButton entryId={e.id} />
                      <EditEntryButton
                        entryId={e.id}
                        title={e.title}
                        category={e.category}
                        description={e.description}
                        workDate={e.workDate.toISOString().slice(0, 10)}
                        durationMinutes={e.durationMinutes}
                      />
                      <DeleteEntryButton entryId={e.id} />
                    </div>
                  ) : null
                }
              />
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} />
    </>
  );
}
