import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { ClientList } from "@/components/clients/client-list";

export default async function ManagerClientsPage() {
  const session = await requireUser(["MANAGER"]);

  const [clients, entryStats] = await Promise.all([
    prisma.client.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { name: "asc" },
    }),
    prisma.invisibleWorkEntry.groupBy({
      by: ["clientName"],
      where: {
        organizationId: session.organizationId,
        managerId: session.userId,
        status: "APPROVED",
        clientName: { not: null },
      },
      _sum: { durationMinutes: true },
    }),
  ]);

  const minutesByName = new Map(
    entryStats.map((s) => [s.clientName!, s._sum.durationMinutes ?? 0])
  );

  const clientsWithStats = clients.map((c) => ({
    id: c.id,
    name: c.name,
    freeMinutesPerMonth: c.freeMinutesPerMonth,
    totalMinutes: minutesByName.get(c.name) ?? 0,
  }));

  return (
    <>
      <PageHeader
        title="Klienti"
        description="Pārvaldiet klientu sarakstu un norādiet iekļautās bezmaksas stundas mēnesī."
      />
      <ClientList clients={clientsWithStats} />
    </>
  );
}
