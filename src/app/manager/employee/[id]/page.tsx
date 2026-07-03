import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EntryCard } from "@/components/entries/entry-card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDurationLV } from "@/lib/utils";

export default async function ManagerEmployeeDetail({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireUser(["MANAGER"]);

  const employee = await prisma.user.findFirst({
    where: {
      id: params.id,
      organizationId: session.organizationId,
      managerId: session.userId,
      role: "EMPLOYEE",
    },
  });
  if (!employee) notFound();

  const entries = await prisma.invisibleWorkEntry.findMany({
    where: { employeeId: employee.id, organizationId: session.organizationId },
    orderBy: { createdAt: "desc" },
  });

  const totalMinutes = entries.reduce((s, e) => s + e.durationMinutes, 0);

  return (
    <>
      <PageHeader
        title={employee.name}
        description={
          employee.title
            ? `${employee.title} · ${employee.email}`
            : employee.email
        }
      />

      <Card className="mb-6">
        <CardContent className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <Stat label="Ieraksti kopā" value={entries.length.toString()} />
          <Stat
            label="Gaida izskatīšanu"
            value={entries.filter((e) => e.status === "PENDING").length.toString()}
          />
          <Stat
            label="Apstiprināti"
            value={entries.filter((e) => e.status === "APPROVED").length.toString()}
          />
          <Stat label="Kopā laiks" value={formatDurationLV(totalMinutes)} />
        </CardContent>
      </Card>

      {entries.length === 0 ? (
        <EmptyState
          title="Šim darbiniekam vēl nav ierakstu"
          description="Kad darbinieks iesniegs neredzamo darbu, tas parādīsies šeit."
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
              managerComment={e.managerComment}
            />
          ))}
        </div>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold mt-0.5">{value}</div>
    </div>
  );
}
