import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { categoriesForUser } from "@/lib/smart-log-server";
import { EntryForm } from "@/components/entries/entry-form";
import { cn } from "@/lib/utils";
import { METRIC_SURFACE } from "@/components/dashboard/apple";

export default async function NewEntryPage({
  searchParams,
}: {
  searchParams: { copyFrom?: string };
}) {
  const session = await requireUser(["EMPLOYEE"]);
  const categories = await categoriesForUser(session.userId);

  const employee = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      manager: true,
    },
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

  let initialValues;
  if (searchParams.copyFrom) {
    const source = await prisma.invisibleWorkEntry.findFirst({
      where: {
        id: searchParams.copyFrom,
        employeeId: session.userId,
        deletedAt: null,
      },
      select: {
        title: true,
        category: true,
        description: true,
        durationMinutes: true,
        clientId: true,
        clientName: true,
      },
    });
    if (source) {
      initialValues = source;
    }
  }

  return (
    // Fills the viewport height (minus the shell's top bar and padding) so the
    // form card reaches the bottom of the screen.
    <div className="flex flex-col sm:min-h-[calc(100dvh-7rem)]">
      <div className="mb-3 [@media(min-height:1000px)]:mb-5">
        <h1 className="font-display text-[22px] font-medium leading-tight [@media(min-height:1000px)]:text-[26px]">Jauns darba ieraksts</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Aprakstiet īsi un godīgi paveikto. Šis ieraksts tiks nosūtīts jūsu vadītājam izskatīšanai.
        </p>
      </div>

      {!employee?.manager ? (
        <div className={cn(METRIC_SURFACE, "p-6 text-[15px]")}>
          Jums vēl nav piesaistīts vadītājs. Lūdzu, sazinieties ar
          administratoru, lai jūs piesaistītu vadītājam, pirms varat
          iesniegt ierakstu.
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          <EntryForm
            clients={clients}
            colleagues={colleagues.flatMap((c) =>
              c.name ? [{ id: c.id, name: c.name }] : []
            )}
            initialValues={initialValues}
            categories={categories}
          />
        </div>
      )}
    </div>
  );
}
