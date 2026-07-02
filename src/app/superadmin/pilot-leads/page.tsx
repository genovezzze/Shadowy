import { redirect } from "next/navigation";
import Image from "next/image";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { Mail, Users, Calendar, ClipboardList } from "lucide-react";
import { isSuperAdmin } from "@/lib/superadmin";

function fmtDate(d: Date) {
  return d.toLocaleDateString("lv-LV", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TEAM_SIZE_LABELS: Record<string, string> = {
  "1-5": "1-5 cilvēki",
  "6-15": "6-15 cilvēki",
  "16-50": "16-50 cilvēki",
  "51+": "51+ cilvēki",
};

export default async function SuperAdminPilotLeadsPage() {
  const session = await getSession();
  if (!session || !isSuperAdmin(session.email)) redirect("/login");

  const leads = await prisma.pilotLead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/shadowy.svg" alt="Shadowy" width={32} height={32} />
          <span className="font-semibold">Shadowy</span>
          <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">
            Super Admin
          </span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <a href="/superadmin" className="text-muted-foreground hover:text-foreground transition-colors">
            Organizācijas
          </a>
          <a href="/superadmin/pilot-leads" className="text-foreground font-medium">
            Pilot pieteikumi
          </a>
          <a href="/api/auth/logout" className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
            Iziet
          </a>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Pilot pieteikumi</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Visi pieteikumi no galvenās lapas veidlapas
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-2 text-center">
            <div className="text-2xl font-bold">{leads.length}</div>
            <div className="text-xs text-muted-foreground">kopā</div>
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList className="h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="font-medium">Pagaidām nav pieteikumu</p>
            <p className="text-sm text-muted-foreground mt-1">
              Kad kāds aizpildīs pilota veidlapu, pieteikums parādīsies šeit.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="rounded-xl border border-border bg-card p-5 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{lead.name}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="font-medium text-emerald-500">{lead.company}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                      <a
                        href={`mailto:${lead.email}`}
                        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {lead.email}
                      </a>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {TEAM_SIZE_LABELS[lead.teamSize] ?? lead.teamSize}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {fmtDate(lead.createdAt)}
                      </span>
                    </div>
                    {lead.comment && (
                      <p className="mt-3 text-sm text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 whitespace-pre-wrap">
                        {lead.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
