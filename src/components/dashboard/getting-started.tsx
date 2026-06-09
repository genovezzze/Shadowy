import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GettingStartedProps {
  hasManagers: boolean;
  hasEmployees: boolean;
  hasEntries: boolean;
}

export function GettingStarted({
  hasManagers,
  hasEmployees,
  hasEntries,
}: GettingStartedProps) {
  const teamAdded = hasManagers || hasEmployees;
  const allDone = teamAdded && hasEntries;
  if (allDone) return null;

  const steps = [
    { done: true },
    { done: teamAdded },
    { done: hasEntries },
  ];
  const completedCount = steps.filter((s) => s.done).length;

  return (
    <Card className="mb-8 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Darba sākšana</CardTitle>
          <span className="text-xs text-muted-foreground">
            {completedCount} / {steps.length} pabeigti
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-border overflow-hidden mt-2">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="grid gap-3">
        {/* Step 1 — always done */}
        <StepRow done label="Organizācija izveidota" description="Jūsu organizācija ir veiksmīgi reģistrēta." />

        {/* Step 2 — team setup with two-path choice */}
        {teamAdded ? (
          <StepRow
            done
            label="Komanda pievienota"
            description="Darbinieki ir pievienoti un var sākt iesniegt ierakstus."
          />
        ) : (
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Circle className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium">Pievienojiet komandu</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Izvēlieties, kā ir sakārtota jūsu organizācija:
                </div>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 ml-8">
              {/* Path A — admin is the manager */}
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Es pats esmu vadītājs
                </div>
                <p className="text-xs text-muted-foreground">
                  Jūs pats izskatīsiet darbinieku ierakstus. Nav nepieciešams izveidot atsevišķu vadītāja kontu.
                </p>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href="/admin/employees">
                    Pievienot darbiniekus <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>

              {/* Path B — separate manager */}
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Man ir atsevišķs vadītājs
                </div>
                <p className="text-xs text-muted-foreground">
                  Izveidojiet vadītāja kontu. Vadītājs pats pievienot savus darbiniekus un izskatīs ierakstus.
                </p>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href="/admin/managers">
                    Izveidot vadītāju <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        <StepRow
          done={hasEntries}
          label="Pirmais ieraksts iesniegts"
          description="Darbinieks iesniedz pirmo neredzamā darba ierakstu."
        />
      </CardContent>
    </Card>
  );
}

function StepRow({
  done,
  label,
  description,
}: {
  done: boolean;
  label: string;
  description: string;
}) {
  return (
    <div
      className={[
        "flex items-start gap-3 rounded-lg p-3",
        done ? "opacity-50" : "bg-card border border-border",
      ].join(" ")}
    >
      {done ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
      ) : (
        <Circle className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
      )}
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      </div>
    </div>
  );
}
