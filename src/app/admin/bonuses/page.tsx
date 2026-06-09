import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  REWARD_LABELS,
  PERIOD_LABELS,
  BONUS_STATUS_LABELS,
  BONUS_STATUS_TONE,
} from "@/lib/reward-types";
import type { RewardType, PeriodType, BonusRequestStatus } from "@/lib/reward-types";
import { formatDateLV } from "@/lib/utils";
import { Gift, CheckCircle2, Clock, ListChecks } from "lucide-react";

export default async function AdminBonusesPage() {
  const session = await requireUser(["ADMIN"]);
  const orgId = session.organizationId;

  const [totalRules, activeRules, pendingRequests, approvedRequests, recentRequests, allRules] =
    await Promise.all([
      prisma.recognitionRule.count({ where: { organizationId: orgId } }),
      prisma.recognitionRule.count({ where: { organizationId: orgId, isActive: true } }),
      prisma.bonusRequest.count({ where: { organizationId: orgId, status: "PENDING" } }),
      prisma.bonusRequest.count({ where: { organizationId: orgId, status: "APPROVED" } }),
      prisma.bonusRequest.findMany({
        where: { organizationId: orgId },
        orderBy: { requestedAt: "desc" },
        take: 20,
        include: {
          employee: { select: { name: true } },
          manager: { select: { name: true } },
          rule: { select: { name: true } },
        },
      }),
      prisma.recognitionRule.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
        include: {
          manager: { select: { name: true } },
          _count: { select: { bonusRequests: true } },
        },
      }),
    ]);

  return (
    <>
      <PageHeader
        title="Bonusu pārskats"
        description="Organizācijas mēroga pārskats par atzinības noteikumiem un bonusu pieprasījumiem."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <KpiCard
          label="Aktīvie noteikumi"
          value={activeRules}
          icon={<ListChecks className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Noteikumi kopā"
          value={totalRules}
          icon={<Gift className="h-5 w-5" />}
        />
        <KpiCard
          label="Gaida izskatīšanu"
          value={pendingRequests}
          icon={<Clock className="h-5 w-5" />}
          tone="warning"
        />
        <KpiCard
          label="Apstiprināti"
          value={approvedRequests}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Visi noteikumi</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {allRules.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="Nav noteikumu"
                  description="Vadītāji vēl nav izveidojuši bonusu noteikumus."
                />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {allRules.map((rule: any) => (
                  <div key={rule.id} className="flex items-start justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{rule.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {rule.manager.name} · {rule.minimumHours}h /{" "}
                        {PERIOD_LABELS[rule.periodType as PeriodType]} ·{" "}
                        {rule._count.bonusRequests} pieprasījumi
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="success" className="text-xs">
                        {REWARD_LABELS[rule.rewardType as RewardType]}
                      </Badge>
                      {!rule.isActive && <Badge variant="muted">Neaktīvs</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Jaunākie pieprasījumi</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentRequests.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="Nav pieprasījumu"
                  description="Darbinieki vēl nav iesnieguši bonusu pieprasījumus."
                />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentRequests.map((req: any) => {
                  const status = req.status as BonusRequestStatus;
                  return (
                    <div key={req.id} className="flex items-start justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {req.employee.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {req.rule.name} · {req.manager.name} ·{" "}
                          {formatDateLV(req.requestedAt)}
                        </div>
                      </div>
                      <Badge variant={BONUS_STATUS_TONE[status]} className="shrink-0 text-xs">
                        {BONUS_STATUS_LABELS[status]}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
