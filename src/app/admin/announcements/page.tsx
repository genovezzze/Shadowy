import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Megaphone } from "lucide-react";
import { CreateAnnouncementForm } from "./create-form";
import { AnnouncementRow } from "./announcement-row";

export default async function AdminAnnouncementsPage() {
  const session = await requireUser(["ADMIN"]);

  const [announcements, employeeCount] = await Promise.all([
    prisma.announcement.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { reads: true } } },
    }),
    prisma.user.count({
      where: { organizationId: session.organizationId, role: "EMPLOYEE" },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Paziņojumi"
        description="Publicējiet paziņojumu, un tas parādīsies kā uznirstošs logs darbiniekiem, kad viņi nākamreiz atvērs Shadowy — līdz brīdim, kad to aizvērs."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-base font-semibold">Jauns paziņojums</h2>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Redzēs visi darbinieki jūsu organizācijā.
              </p>
              <CreateAnnouncementForm />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {announcements.length === 0 ? (
            <EmptyState
              icon={<Megaphone className="h-6 w-6" />}
              title="Vēl nav paziņojumu"
              description="Izveidojiet pirmo paziņojumu, lai informētu darbiniekus par izmaiņām."
            />
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <AnnouncementRow
                  key={a.id}
                  id={a.id}
                  title={a.title}
                  body={a.body}
                  createdAt={a.createdAt.toISOString()}
                  readCount={a._count.reads}
                  totalEmployees={employeeCount}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
