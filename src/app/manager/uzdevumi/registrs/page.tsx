import Link from "next/link";
import { ArrowLeft, FileSpreadsheet } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { requireTeamTasks } from "@/lib/team-tasks-server";
import { RegistryEditor } from "@/components/team-tasks/registry-editor";
import { APPLE_PILL } from "@/components/dashboard/apple";

export const dynamic = "force-dynamic";

export default async function RegistryPage() {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  await requireTeamTasks(session.organizationId);
  const organizationId = session.organizationId;

  const [reportTypes, clients, people] = await Promise.all([
    prisma.reportType.findMany({
      where: { organizationId, ownerUserId: null },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, dueDay: true, active: true },
    }),
    prisma.client.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        status: true,
        responsibleUserId: true,
        assignments: { select: { employeeId: true } },
        reports: {
          select: { reportTypeId: true, responsibleUserId: true, frequency: true, dueDay: true },
        },
      },
    }),
    prisma.user.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Klientu reģistrs"
        description="Kurām klientu atskaitēm jātop katru mēnesi un kas par tām atbild. No šejienes katra mēneša 1. datumā izveidojas uzdevumi."
        actions={
          <>
            <Link href="/manager/uzdevumi" className={APPLE_PILL}>
              <ArrowLeft className="h-3.5 w-3.5" />
              Uz uzdevumiem
            </Link>
            <Link href="/manager/uzdevumi/imports" className={APPLE_PILL}>
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Importēt no Excel
            </Link>
          </>
        }
      />
      <RegistryEditor
        reportTypes={reportTypes}
        clients={clients.map((c) => ({
          id: c.id,
          name: c.name,
          active: c.status === "active",
          responsibleUserId: c.responsibleUserId,
          // Shown as a hint when nobody is named yet: generation falls back to
          // the only linked employee.
          fallbackUserId: c.assignments.length === 1 ? c.assignments[0].employeeId : null,
          reports: c.reports,
        }))}
        people={people}
      />
    </div>
  );
}
