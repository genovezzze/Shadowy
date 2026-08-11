import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { SmartWorkLog } from "@/components/entries/smart-work-log";

export default async function SmartLogPage() {
  const session = await requireUser(["EMPLOYEE"]);

  const employee = await prisma.user.findFirst({
    where: { id: session.userId, organizationId: session.organizationId },
    select: { managerId: true, canSeeAllClients: true },
  });

  const clients = await prisma.client.findMany({
    where: {
      organizationId: session.organizationId,
      status: "active",
      ...(employee?.canSeeAllClients
        ? {}
        : { assignments: { some: { employeeId: session.userId } } }),
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  // Colleagues to name as the recipient of help - same org, excluding self.
  const colleagues = await prisma.user.findMany({
    where: {
      organizationId: session.organizationId,
      NOT: { id: session.userId },
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  if (!employee?.managerId) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <Card className="w-full max-w-xl">
          <CardContent className="p-6 text-center text-sm leading-6 text-muted-foreground">
            Tev vēl nav piesaistīts vadītājs. Sazinies ar administratoru, lai
            varētu iesniegt darba ierakstus.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SmartWorkLog
      clients={clients}
      colleagues={colleagues.flatMap((c) =>
        c.name ? [{ id: c.id, name: c.name }] : []
      )}
    />
  );
}
