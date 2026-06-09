import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { RoleCard } from "./role-card";
import { CreateRoleForm } from "./create-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase } from "lucide-react";

export default async function ManagerRolesPage() {
  const session = await requireUser(["MANAGER"]);

  const [roles, employees] = await Promise.all([
    prisma.workRole.findMany({
      where: { managerId: session.userId },
      orderBy: { createdAt: "asc" },
      include: {
        duties: { orderBy: { createdAt: "asc" } },
        employees: { select: { id: true, name: true, workRoleId: true } },
      },
    }),
    prisma.user.findMany({
      where: { managerId: session.userId, role: "EMPLOYEE" },
      select: { id: true, name: true, workRoleId: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Lomas un pienākumi"
        description="Izveidojiet lomas saviem darbiniekiem un norādiet oficiālos pienākumus. Sistēma izmantos šo informāciju, lai noteiktu, vai iesniegtais darbs ietilpst darbinieka lomā vai ir papildu ieguldījums."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-base font-semibold mb-1">Izveidot jaunu lomu</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Pienākumus varēsiet pievienot pēc lomas izveidošanas.
              </p>
              <CreateRoleForm />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {roles.length === 0 ? (
            <EmptyState
              icon={<Briefcase className="h-5 w-5" />}
              title="Vēl nav izveidotas lomas"
              description="Izveidojiet pirmo lomu, lai sāktu piešķirt pienākumus saviem darbiniekiem."
            />
          ) : (
            roles.map(r => (
              <RoleCard
                key={r.id}
                id={r.id}
                name={r.name}
                description={r.description}
                duties={r.duties}
                assignedEmployees={r.employees}
                allEmployees={employees}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
