import { Eye, EyeOff, Download, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataRequestForm } from "./data-request-form";

// Who can see each kind of data. Kept in one place so the page is the single
// honest source of truth about visibility.
const VISIBILITY: { field: string; who: string }[] = [
  { field: "Vārds un e-pasts", who: "Tu · tavs vadītājs · administrators" },
  { field: "Neredzamā darba ieraksti (nosaukums, apraksts, ilgums, datums)", who: "Tu · tavs vadītājs · administrators" },
  { field: "Kad ieraksts veikts un kad ievadīts", who: "Tu · tavs vadītājs · administrators" },
  { field: "Kam tu palīdzēji (kolēģim)", who: "Tu · tavs vadītājs · administrators" },
  { field: "Klients / uzņēmums ierakstā", who: "Tu · tavs vadītājs · administrators" },
  { field: "Tava loma un pienākumi", who: "Tu · tavs vadītājs · administrators" },
];

const HIDDEN: string[] = [
  "Melnraksti, kurus tu neesi iesniedzis",
  "Balss ieraksti — tie netiek saglabāti, tikai pārvērsti tekstā",
  "Reāllaika sekošana, ekrāns, atrašanās vieta vai peles kustības — tādu datu nav vispār",
];

export default async function EmployeePrivacyPage() {
  const session = await requireUser(["EMPLOYEE"]);

  const [entryCount, helpedCount] = await Promise.all([
    prisma.invisibleWorkEntry.count({
      where: { organizationId: session.organizationId, employeeId: session.userId, deletedAt: null },
    }),
    prisma.invisibleWorkEntry.count({
      where: { organizationId: session.organizationId, employeeId: session.userId, deletedAt: null, helpedColleague: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="pb-6">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-foreground/50">
          Privātums
        </div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <ShieldCheck className="h-7 w-7 text-emerald-500" />
          Kas par tevi ir redzams
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Shadowy nav novērošanas rīks. Šeit precīzi redzi, kādi tavi dati tiek glabāti un kurš tos redz.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <div className="text-2xl font-bold tabular-nums">{entryCount}</div>
          <div className="text-xs text-muted-foreground">tavi ieraksti</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold tabular-nums">{helpedCount}</div>
          <div className="text-xs text-muted-foreground">reizes palīdzēji kolēģim</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold tabular-nums">0</div>
          <div className="text-xs text-muted-foreground">sekošanas datu par tevi</div>
        </Card>
      </div>

      {/* Visible data */}
      <Card className="mb-6 overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Kas ir redzams un kam
          </span>
        </div>
        <div className="divide-y divide-border/40">
          {VISIBILITY.map((row) => (
            <div key={row.field} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="text-sm font-medium">{row.field}</div>
              <div className="shrink-0 text-xs text-muted-foreground">{row.who}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Hidden data */}
      <Card className="mb-6 overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3">
          <EyeOff className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Ko neviens neredz
          </span>
        </div>
        <ul className="divide-y divide-border/40">
          {HIDDEN.map((item) => (
            <li key={item} className="flex items-start gap-2.5 px-5 py-3 text-sm text-muted-foreground">
              <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500/70" />
              {item}
            </li>
          ))}
        </ul>
      </Card>

      {/* Actions */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold">Tavas tiesības</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tu jebkurā brīdī vari lejupielādēt visus savus datus vai lūgt tos dzēst.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button asChild>
            <a href="/api/export/entries" download>
              <Download className="h-4 w-4" />
              Lejupielādēt manus datus (CSV)
            </a>
          </Button>
        </div>
        <div className="mt-4">
          <DataRequestForm />
        </div>
      </Card>
    </div>
  );
}
