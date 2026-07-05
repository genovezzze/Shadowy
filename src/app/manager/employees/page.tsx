import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { CreateEmployeeForm } from "./create-form";
import { EmployeeCard } from "./employee-card";
import { EmptyState } from "@/components/ui/empty-state";
import { UserPlus, Users } from "lucide-react";

export default async function ManagerEmployeesPage() {
  const session = await requireUser(["MANAGER", "ADMIN"]);
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
          <Card className="relative overflow-hidden p-0">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent dark:block hidden" />
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border dark:border-white/[0.07]">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                <UserPlus className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Pievienot darbinieku</div>
                <p className="text-xs text-muted-foreground">
                  Darbinieks ar šiem datiem varēs pieslēgties Shadowy.
                </p>
              </div>
            </div>
            <div className="p-6">
              <CreateEmployeeForm />
            </div>
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
