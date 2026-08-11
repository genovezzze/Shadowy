import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { ClientList } from "@/components/clients/client-list";
import { LinkEntriesButton } from "@/components/clients/link-entries-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileSpreadsheet } from "lucide-react";
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
      include: {
        assignments: { select: { employeeId: true } },
        aliases: { select: { normalized: true } },
      },
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

  // Totals come from the matrix so the list and the matrix agree on what
  // belongs to a client - including hours logged under one of its aliases.
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

  const clientsWithStats = clients.map((c) => ({
    id: c.id,
    name: c.name,
    freeMinutesPerMonth: c.freeMinutesPerMonth,
    status: c.status,
    totalMinutes: clientRowsById.get(c.id)?.totalMinutes ?? 0,
    overrunMinutes: clientRowsById.get(c.id)?.overrunMinutes ?? 0,
    assignedEmployeeIds: c.assignments.map((a) => a.employeeId),
  }));

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
