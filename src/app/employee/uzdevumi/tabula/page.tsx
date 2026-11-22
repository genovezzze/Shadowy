import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { requireTeamTasks } from "@/lib/team-tasks-server";
import { RegistryEditor } from "@/components/team-tasks/registry-editor";
import { APPLE_PILL } from "@/components/dashboard/apple";

export const dynamic = "force-dynamic";

/** An employee's own sheet: their columns and deadlines for "Tavi klienti". */
export default async function MySheetPage() {
  const session = await requireUser(["EMPLOYEE"]);
  await requireTeamTasks(session.organizationId);

  const [reportTypes, clients] = await Promise.all([
    prisma.reportType.findMany({
      where: { organizationId: session.organizationId, ownerUserId: session.userId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, dueDay: true, active: true },
    }),
    prisma.client.findMany({
      where: {
        organizationId: session.organizationId,
        assignments: { some: { employeeId: session.userId } },
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        status: true,
        reports: {
          where: { reportType: { ownerUserId: session.userId } },
          select: { reportTypeId: true, responsibleUserId: true, frequency: true, dueDay: true },
        },
      },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Mana tabula"
        description="Jūsu kolonnas un termiņi. Klienti ir tie, kas jums piesaistīti (Tavi klienti); katru mēnesi no šīs tabulas uzdevumi izveidojas paši."
        actions={
          <Link href="/employee/uzdevumi" className={APPLE_PILL}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Uz uzdevumiem
          </Link>
        }
      />
      {clients.length === 0 && (
        <p className="mb-5 rounded-xl border border-black/[0.08] bg-black/[0.03] px-4 py-3 text-sm text-muted-foreground dark:border-white/[0.1] dark:bg-white/[0.04]">
          Jums vēl nav piesaistītu klientu. Palūdziet vadītājam tos piesaistīt sadaļā “Klienti”, un tie parādīsies šeit.
        </p>
      )}
      <RegistryEditor
        scope="mine"
        reportTypes={reportTypes}
        clients={clients.map((c) => ({
          id: c.id,
          name: c.name,
          active: c.status === "active",
          responsibleUserId: null,
          fallbackUserId: null,
          reports: c.reports,
        }))}
        people={[]}
      />
    </div>
  );
}
