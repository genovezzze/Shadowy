import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CreateEmployeeForm } from "./create-form";
import { EmployeeCard } from "./employee-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";

export default async function ManagerEmployeesPage() {
  const session = await requireUser(["MANAGER"]);
  const employees = await prisma.user.findMany({
    where: {
      organizationId: session.organizationId,
      managerId: session.userId,
      role: "EMPLOYEE",
    },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { submittedEntries: true } } },
  });

  return (
    <>
      <PageHeader
        title="Mana komanda"
        description="Pievienojiet savus darbiniekus un sekojiet viņu neredzamā darba aktivitātei. Redzami tikai jūsu komandas dati."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-base font-semibold">Pievienot darbinieku</h2>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Darbinieks ar šiem datiem varēs pieslēgties Shadowy.
              </p>
              <CreateEmployeeForm />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-3">
          {employees.length === 0 ? (
            <EmptyState
              icon={<Users className="h-5 w-5" />}
              title="Vēl nav pievienoti darbinieki"
              description="Pievienojiet pirmo darbinieku, lai sāktu apkopot neredzamo darbu."
            />
          ) : (
            employees.map((e: typeof employees[number]) => (
              <EmployeeCard
                key={e.id}
                id={e.id}
                name={e.name}
                email={e.email}
                title={e.title}
                entryCount={e._count.submittedEntries}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
