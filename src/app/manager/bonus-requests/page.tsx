import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { RequestCard } from "./request-card";
import { Inbox } from "lucide-react";

export default async function BonusRequestsPage() {
  const session = await requireUser(["MANAGER"]);

  const [pending, reviewed] = await Promise.all([
    prisma.bonusRequest.findMany({
      where: { managerId: session.userId, status: "PENDING" },
      orderBy: { requestedAt: "asc" },
      include: {
        employee: { select: { name: true } },
        rule: { select: { name: true, minimumHours: true, periodType: true, categories: true } },
      },
    }),
    prisma.bonusRequest.findMany({
      where: {
        managerId: session.userId,
        status: { in: ["APPROVED", "REJECTED", "RETURNED"] },
      },
      orderBy: { updatedAt: "desc" },
      take: 30,
      include: {
        employee: { select: { name: true } },
        rule: { select: { name: true, minimumHours: true, periodType: true, categories: true } },
      },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Bonusu pieprasījumi"
        description="Izskatiet darbinieku bonusu pieprasījumus un pieņemiet lēmumu."
      />

      <section className="mb-10">
        <h2 className="text-base font-semibold mb-3">
          Gaida izskatīšanu ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-5 w-5" />}
            title="Nav jaunu pieprasījumu"
            description="Kad darbinieki iesniegs bonusu pieprasījumus, tie parādīsies šeit."
          />
        ) : (
          <div className="grid gap-4">
            {pending.map((r: any) => (
              <RequestCard key={r.id} request={r} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-base font-semibold mb-3">Jau izskatītie</h2>
        {reviewed.length === 0 ? (
          <EmptyState
            title="Vēl nav izskatītu pieprasījumu"
            description="Apstiprināti, noraidīti un atpakaļ nosūtītie pieprasījumi parādīsies šeit."
          />
        ) : (
          <div className="grid gap-4">
            {reviewed.map((r: any) => (
              <RequestCard key={r.id} request={r} reviewed />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
