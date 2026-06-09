import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { CreateEmployeeForm } from "./create-form";
import { EmployeeRow } from "./employee-row";
import { Users } from "lucide-react";

export default async function AdminEmployeesPage() {
  const session = await requireUser(["ADMIN"]);

  const [employees, managers] = await Promise.all([
    prisma.user.findMany({
      where: { organizationId: session.organizationId, role: "EMPLOYEE" },
      orderBy: { createdAt: "desc" },
      include: {
        manager: true,
        _count: { select: { submittedEntries: true } },
      },
    }),
    prisma.user.findMany({
      where: { organizationId: session.organizationId, role: "MANAGER" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Darbinieki"
        description="Pievienojiet darbiniekus tieši vai ar vadītāja starpniecību. Ja darbiniekam nav vadītāja, viņa ierakstus var pārskatīt administrators."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-base font-semibold">Pievienot darbinieku</h2>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Darbinieks ar šiem datiem varēs pieslēgties Shadowy.
              </p>
              <CreateEmployeeForm managers={managers} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {employees.length === 0 ? (
            <EmptyState
              icon={<Users className="h-5 w-5" />}
              title="Vēl nav pievienoti darbinieki"
              description="Pievienojiet pirmo darbinieku kreisajā formā vai lūdziet vadītāju to izdarīt."
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground border-b border-border">
                    <tr>
                      <th className="text-left font-medium px-6 py-3">Vārds</th>
                      <th className="text-left font-medium px-6 py-3">Amats</th>
                      <th className="text-left font-medium px-6 py-3">Vadītājs</th>
                      <th className="text-right font-medium px-6 py-3">Ieraksti</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {employees.map((e) => (
                      <EmployeeRow
                        key={e.id}
                        id={e.id}
                        name={e.name}
                        email={e.email}
                        title={e.title}
                        managerId={e.managerId}
                        managerName={e.manager?.name ?? null}
                        entryCount={e._count.submittedEntries}
                        managers={managers}
                      />
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
