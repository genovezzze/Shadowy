import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { ClientList } from "@/components/clients/client-list";
import { LinkEntriesButton } from "@/components/clients/link-entries-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileSpreadsheet } from "lucide-react";
import { normalizeClientName } from "@/lib/client-name";
import { clientMonthOptions, resolveClientMonth } from "@/lib/client-month";
import { ClientMonthSelector } from "@/components/dashboard/client-month-selector";
import { buildClientMatrix } from "@/lib/client-matrix";

export default async function ManagerClientsPage({
  searchParams,
}: {
  searchParams: { clientMonth?: string };
}) {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  const clientMonth = resolveClientMonth(searchParams?.clientMonth);

  const [clients, entryStats, employees, clientMonthHistory] = await Promise.all([
    prisma.client.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { name: "asc" },
      include: { assignments: { select: { employeeId: true } } },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: {
        organizationId: session.organizationId,
        ...(session.role === "MANAGER" ? { managerId: session.userId } : {}),
        status: "APPROVED",
        deletedAt: null,
        ...(clientMonth.isAll ? {} : { workDate: { gte: clientMonth.start!, lt: clientMonth.end! } }),
        OR: [{ clientId: { not: null } }, { clientName: { not: null } }],
      },
      select: { clientId: true, clientName: true, durationMinutes: true, workDate: true },
    }),
    prisma.user.findMany({
      where: {
        organizationId: session.organizationId,
        role: "EMPLOYEE",
        ...(session.role === "MANAGER" ? { managerId: session.userId } : {}),
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: {
        organizationId: session.organizationId,
        ...(session.role === "MANAGER" ? { managerId: session.userId } : {}),
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
  );

  const minutesById = new Map<string, number>();
  const minutesByNameLower = new Map<string, number>();
  for (const e of entryStats) {
    if (e.clientId) {
      minutesById.set(e.clientId, (minutesById.get(e.clientId) ?? 0) + e.durationMinutes);
    } else if (e.clientName) {
      const key = normalizeClientName(e.clientName);
      minutesByNameLower.set(key, (minutesByNameLower.get(key) ?? 0) + e.durationMinutes);
    }
  }

  const clientsWithStats = clients.map((c) => ({
    id: c.id,
    name: c.name,
    freeMinutesPerMonth: c.freeMinutesPerMonth,
    status: c.status,
    totalMinutes: (minutesById.get(c.id) ?? 0) + (minutesByNameLower.get(normalizeClientName(c.name)) ?? 0),
    overrunMinutes: 0,
    assignedEmployeeIds: c.assignments.map((a) => a.employeeId),
  }));

  const { rows: clientRows } = buildClientMatrix(
    entryStats.map((entry) => ({
      ...entry,
      employeeId: "all",
      employeeName: "Visi",
    })),
    clients,
    { resetLimitMonthly: clientMonth.isAll },
  );
  const clientRowsById = new Map(clientRows.map((row) => [row.clientId, row]));
  for (const client of clientsWithStats) {
    client.overrunMinutes = clientRowsById.get(client.id)?.overrunMinutes ?? 0;
  }

  return (
    <>
      <PageHeader
        title={`Klienti (${clients.length})`}
        description="Pārvaldiet klientu sarakstu, piešķiriet darbiniekus un norādiet bezmaksas stundas mēnesī."
        actions={
          session.role === "ADMIN" ? (
            <div className="flex items-center gap-2">
              <LinkEntriesButton />
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/clients/import">
                  <FileSpreadsheet className="h-4 w-4" />
                  Importēt no Excel
                </Link>
              </Button>
            </div>
          ) : null
        }
      />
      <ClientMonthSelector selectedMonth={clientMonth.key} options={availableClientMonths} />
      <ClientList clients={clientsWithStats} employees={employees} />
    </>
  );
}
