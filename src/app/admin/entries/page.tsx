import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { EntryCard } from "@/components/entries/entry-card";
import { EntriesFilter } from "@/components/entries/entries-filter";
import { Pagination } from "@/components/entries/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { buildExportHref } from "@/lib/entry-filter";
import { SMART_LOG_CATEGORIES } from "@/lib/smart-log";
import { AdminReviewActions } from "@/components/entries/admin-review-actions";
import {
  buildEntryWhere,
  hasActiveFilters,
  parsePage,
  PAGE_SIZE,
  type EntrySearchParams,
} from "@/lib/entry-filter";

export default async function AdminEntriesPage({
  searchParams,
}: {
  searchParams: EntrySearchParams & { page?: string };
}) {
  const session = await requireUser(["ADMIN"]);

  const where = {
    organizationId: session.organizationId,
    ...buildEntryWhere(searchParams),
  };

  const [total, employees, clientSource] = await Promise.all([
    prisma.invisibleWorkEntry.count({ where }),
    prisma.user.findMany({
      where: { organizationId: session.organizationId, role: "EMPLOYEE" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: { organizationId: session.organizationId, deletedAt: null },
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
    include: {
      employee: true,
      manager: true,
      helpedUser: { select: { name: true } },
    },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const filtered = hasActiveFilters(searchParams);

  return (
    <>
      <PageHeader
        title="Visi ieraksti"
        description="Pārskats par visiem neredzamā darba ierakstiem organizācijā. Šeit redzams arī ierakstu statuss un vadītāju komentāri."
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
        employees={employees}
        clients={clientOptions}
      />

      <div className="mb-3 text-sm text-muted-foreground">
        Atrasti {total} ieraksti
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-5 w-5" />}
          title={filtered ? "Nav atrasts neviens ieraksts" : "Pagaidām nav ierakstu"}
          description={
            filtered
              ? "Mēģiniet mainīt vai notīrīt filtrus."
              : "Kad darbinieki sāks iesniegt ierakstus, tie parādīsies šeit."
          }
        />
      ) : (
        <div className="grid gap-4">
          {entries.map((e) => (
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
              helpedColleague={e.helpedColleague}
              helpedName={e.helpedUser?.name}
              footer={
                e.status !== "REJECTED" ? (
                  <AdminReviewActions entryId={e.id} />
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Vadītājs: {e.manager?.name ?? "Administrators"}
                  </div>
                )
              }
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} />
    </>
  );
}
