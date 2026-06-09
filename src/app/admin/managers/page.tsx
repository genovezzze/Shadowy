import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CreateManagerForm } from "./create-form";
import { ManagerCard } from "./manager-card";
import { EmptyState } from "@/components/ui/empty-state";
import { UserCog } from "lucide-react";

export default async function AdminManagersPage() {
  const session = await requireUser(["ADMIN"]);
  const managers = await prisma.user.findMany({
    where: { organizationId: session.organizationId, role: "MANAGER" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { employees: true } } },
  });

  return (
    <>
      <PageHeader
        title="Vadītāji"
        description="Izveidojiet un pārvaldiet vadītāju kontus. Vadītāji savukārt veido savus darbiniekus un izskata viņu ierakstus."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-base font-semibold">Pievienot vadītāju</h2>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Vadītājs saņems pieslēgšanās datus, ko jūs šeit norādīsiet.
              </p>
              <CreateManagerForm />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-3">
          {managers.length === 0 ? (
            <EmptyState
              icon={<UserCog className="h-5 w-5" />}
              title="Vēl nav pievienoti vadītāji"
              description="Sāciet, izveidojot pirmo vadītāja kontu kreisajā formā."
            />
          ) : (
            managers.map((m: typeof managers[number]) => (
              <ManagerCard
                key={m.id}
                id={m.id}
                name={m.name}
                email={m.email}
                title={m.title}
                employeeCount={m._count.employees}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
