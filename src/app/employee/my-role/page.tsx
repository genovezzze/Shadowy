import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Info, Lightbulb } from "lucide-react";

export default async function MyRolePage() {
  const session = await requireUser(["EMPLOYEE"]);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      workRole: {
        include: { duties: { orderBy: { createdAt: "asc" } } },
      },
    },
  });

  const role = user?.workRole;

  return (
    <>
      <PageHeader
        title="Mana loma"
        description="Šeit redzat savu oficiālo lomu un pienākumus. Darbs, kas pārsniedz šo sarakstu, var tikt atzīts kā papildu ieguldījums."
      />

      {!role ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mx-auto mb-4">
              <Info className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-base mb-1">Loma vēl nav piešķirta</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Jūsu vadītājs vēl nav piešķīris jums oficiālu lomu. Sazinieties ar vadītāju, lai noskaidrotu savus pienākumus.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{role.name}</h2>
                  {role.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">{role.description}</p>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Oficiālie pienākumi
                </div>
                {role.duties.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    Pienākumi vēl nav norādīti.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {role.duties.map(d => (
                      <li key={d.id} className="flex items-start gap-2.5 text-sm">
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-[7px]" />
                        <span>{d.text}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex gap-3">
                <Lightbulb className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Ko nozīmē &quot;papildu ieguldījums&quot;?</p>
                  <p className="text-muted-foreground">
                    Kad iesniedzat darbu, kas <strong>neietilpst</strong> jūsu oficiālo pienākumu sarakstā, sistēma to atzīmē kā papildu ieguldījumu.
                  </p>
                  <p className="text-muted-foreground">
                    Tas palīdz jūsu vadītājam redzēt, kur jūs darāt vairāk, nekā prasīts - un var kalpot par pamatu sarunai par lomu vai noslodzes pārskatīšanu.
                  </p>
                  <p className="text-muted-foreground">
                    Mērķis nav kontrole - bet <strong>atzinība un taisnīgums</strong>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">
              💡 Ja regulāri veicat uzdevumus ārpus savas lomas, iesakiet vadītājam pārskatīt pienākumu sarakstu - vai arī vienkārši iesniedziet tos kā ierakstu, lai tie kļūtu redzami.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
