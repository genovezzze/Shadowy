import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { ClientList } from "@/components/clients/client-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileSpreadsheet } from "lucide-react";

export default async function ManagerClientsPage() {
  const session = await requireUser(["MANAGER", "ADMIN"]);

  const [clients, entryStats, employees] = await Promise.all([
    prisma.client.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { name: "asc" },
      include: { assignments: { select: { employeeId: true } } },
    }),
    prisma.invisibleWorkEntry.groupBy({
      by: ["clientName"],
      where: {
        organizationId: session.organizationId,
        managerId: session.userId,
        status: "APPROVED",
        clientName: { not: null },
        deletedAt: null,
      },
      _sum: { durationMinutes: true },
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
  ]);

  const minutesByName = new Map(
    entryStats.map((s) => [s.clientName!, s._sum.durationMinutes ?? 0])
  );

  const clientsWithStats = clients.map((c) => ({
    id: c.id,
    name: c.name,
    freeMinutesPerMonth: c.freeMinutesPerMonth,
    status: c.status,
    totalMinutes: minutesByName.get(c.name) ?? 0,
    assignedEmployeeIds: c.assignments.map((a) => a.employeeId),
  }));

  return (
    <>
      <PageHeader
        title={`Klienti (${clients.length})`}
        description="Pārvaldiet klientu sarakstu, piešķiriet darbiniekus un norādiet bezmaksas stundas mēnesī."
        actions={
          session.role === "ADMIN" ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/clients/import">
                <FileSpreadsheet className="h-4 w-4" />
                Importēt no Excel
              </Link>
            </Button>
          ) : null
        }
      />
      <ClientList clients={clientsWithStats} employees={employees} />
    </>
  );
}
