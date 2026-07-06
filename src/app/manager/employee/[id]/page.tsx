import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EntryCard } from "@/components/entries/entry-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatDurationLV } from "@/lib/utils";
import { toggleCanSeeAllClients } from "./actions";

export default async function ManagerEmployeeDetail({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireUser(["MANAGER", "ADMIN"]);

  const employee = await prisma.user.findFirst({
    where: {
      id: params.id,
      organizationId: session.organizationId,
      role: "EMPLOYEE",
      ...(session.role === "MANAGER" ? { managerId: session.userId } : {}),
    },
  });
  if (!employee) notFound();

  const entries = await prisma.invisibleWorkEntry.findMany({
    where: { employeeId: employee.id, organizationId: session.organizationId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, category: true, description: true,
      clientName: true, clientId: true,
      workDate: true, durationMinutes: true, status: true, managerComment: true,
    },
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
        <div className="border-t border-border px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium">Redz visus klientus</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Ja ieslēgts — darbinieks var izvēlēties jebkuru klientu iesniedzot ierakstu
            </div>
          </div>
          <form action={async () => {
            "use server";
            await toggleCanSeeAllClients(employee.id, employee.canSeeAllClients);
          }}>
            <Button
              type="submit"
              variant={employee.canSeeAllClients ? "default" : "outline"}
              size="sm"
            >
              {employee.canSeeAllClients ? "Ieslēgts" : "Izslēgts"}
            </Button>
          </form>
        </div>
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
              clientHref={e.clientId ? `/manager/clients/${e.clientId}` : undefined}
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
