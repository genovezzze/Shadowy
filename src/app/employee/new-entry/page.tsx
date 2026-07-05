import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { EntryForm } from "@/components/entries/entry-form";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";

export default async function NewEntryPage() {
  const session = await requireUser(["EMPLOYEE"]);

  const employee = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      manager: true,
      workRole: { include: { duties: { orderBy: { createdAt: "asc" } } } },
    },
  });

  const duties = employee?.workRole?.duties ?? [];

  return (
    <>
      <PageHeader
        title="Jauns ieraksts par neredzamo darbu"
        description="Aprakstiet īsi un godīgi paveikto. Šis ieraksts tiks nosūtīts jūsu vadītājam izskatīšanai."
      />

      {!employee?.manager ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-sm">
              Jums vēl nav piesaistīts vadītājs. Lūdzu, sazinieties ar
              administratoru, lai jūs piesaistītu vadītājam, pirms varat
              iesniegt ierakstu.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <EntryForm />

          {/* Duties sidebar */}
          <div className="rounded-xl border border-border bg-card p-5 h-fit">
            <h3 className="text-sm font-semibold mb-1">Jūsu lomas pienākumi</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Ieraksti, kas atbilst šiem pienākumiem, tiek klasificēti kā{" "}
              <span className="text-emerald-500 font-medium">ietilpst lomā</span>.
            </p>

            {duties.length === 0 ? (
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Circle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>Jūsu vadītājs vēl nav definējis lomas pienākumus.</span>
              </div>
            ) : (
              <ul className="space-y-2">
                {duties.map((d) => (
                  <li key={d.id} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{d.text}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 pt-4 border-t border-border space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                Ietilpst lomā - atbilst pienākumiem
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                Papildu ieguldījums - virs lomas
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/40 shrink-0" />
                Bez piesaistītas lomas
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
