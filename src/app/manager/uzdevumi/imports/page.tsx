import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { requireTeamTasks } from "@/lib/team-tasks-server";
import { APPLE_PILL } from "@/components/dashboard/apple";
import { RegistryImport } from "./registry-import";

export const dynamic = "force-dynamic";

export default async function RegistryImportPage() {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  await requireTeamTasks(session.organizationId);

  const people = await prisma.user.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <PageHeader
        title="Importēt no Excel"
        description="Augšupielādējiet mēneša atskaišu tabulu: rindās klienti, kolonnās atskaites, pelēka šūna - atskaite nav vajadzīga. Pirms saglabāšanas varēsiet visu pārbaudīt."
        actions={
          <Link href="/manager/clients/atskaites" className={APPLE_PILL}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Uz atskaitēm
          </Link>
        }
      />
      <RegistryImport people={people} />
    </div>
  );
}
