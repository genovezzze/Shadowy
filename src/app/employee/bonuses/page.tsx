import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RequestDialog } from "./request-dialog";
import { calculateEligibility } from "@/lib/bonus-eligibility";
import {
  REWARD_LABELS,
  PERIOD_LABELS,
  BONUS_STATUS_LABELS,
  BONUS_STATUS_TONE,
} from "@/lib/reward-types";
import type { RewardType, PeriodType, BonusRequestStatus } from "@/lib/reward-types";
import { formatDateLV } from "@/lib/utils";
import { Gift, Award } from "lucide-react";

export default async function EmployeeBonusesPage() {
  const session = await requireUser(["EMPLOYEE"]);

  const employee = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { managerId: true, workRoleId: true },
  });

  if (!employee?.managerId) {
    return (
      <>
        <PageHeader
          title="Atzinība"
          description="Šeit redzami jūsu bonusu noteikumi un pieprasījumi."
        />
        <EmptyState
          icon={<Award className="h-5 w-5" />}
          title="Nav piesaistīta vadītāja"
          description="Sazinieties ar administratoru, lai jums tiktu piesaistīts vadītājs."
        />
      </>
    );
  }

  const [rules, approvedEntries, myRequests] = await Promise.all([
    prisma.recognitionRule.findMany({
      where: { managerId: employee.managerId, isActive: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.invisibleWorkEntry.findMany({
      where: { employeeId: session.userId, status: "APPROVED" },
      select: { durationMinutes: true, category: true, workDate: true },
    }),
    prisma.bonusRequest.findMany({
      where: { employeeId: session.userId },
      orderBy: { requestedAt: "desc" },
      include: {
        rule: { select: { name: true, minimumHours: true, periodType: true } },
      },
    }),
  ]);

  const pendingRequestRuleIds = new Set(
    myRequests
      .filter((r: any) => r.status === "PENDING" || r.status === "APPROVED")
      .map((r: any) => r.ruleId)
  );

  const ruleEligibility = rules.map((rule: any) => ({
    rule,
    result: calculateEligibility(
      {
        minimumHours: rule.minimumHours,
        periodType: rule.periodType,
        categories: rule.categories,
        workRoleIds: rule.workRoleIds,
      },
      approvedEntries,
      employee.workRoleId
    ),
    alreadyRequested: pendingRequestRuleIds.has(rule.id),
  }));

  const eligible = ruleEligibility.filter((x) => x.result.eligible && !x.alreadyRequested);
  const inProgress = ruleEligibility.filter(
    (x) => !x.result.eligible && x.result.progressPercent > 0
  );
  const locked = ruleEligibility.filter(
    (x) => !x.result.eligible && x.result.progressPercent === 0
  );
  const requested = ruleEligibility.filter((x) => x.alreadyRequested);

  return (
    <>
      <PageHeader
        title="Atzinība"
        description="Šeit redzami jūsu bonusu noteikumi, progress un iesniegtie pieprasījumi."
      />

      {/* Available now */}
      {eligible.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Pieejami pieprasīšanai ({eligible.length})
          </h2>
          <div className="grid gap-3">
            {eligible.map(({ rule, result }) => (
              <Card key={rule.id} className="border-emerald-500/20">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-sm">{rule.name}</div>
                      {rule.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {rule.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge variant="success">
                          {REWARD_LABELS[rule.rewardType as RewardType]}
                        </Badge>
                        <Badge variant="default">
                          {result.hours}h / {rule.minimumHours}h (
                          {PERIOD_LABELS[rule.periodType as PeriodType]})
                        </Badge>
                        {rule.categories.length > 0 &&
                          rule.categories.map((c: string) => (
                            <Badge key={c} variant="outline">{c}</Badge>
                          ))}
                      </div>
                    </div>
                    <RequestDialog
                      rule={{ id: rule.id, name: rule.name, rewardType: rule.rewardType }}
                      hoursAccumulated={result.hours}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Already requested */}
      {requested.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-3">
            Pieprasīts ({requested.length})
          </h2>
          <div className="grid gap-3">
            {requested.map(({ rule, result }) => (
              <Card key={rule.id} className="opacity-70">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-sm">{rule.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {result.hours}h uzkrāts · {REWARD_LABELS[rule.rewardType as RewardType]}
                      </div>
                    </div>
                    <Badge variant="default">Gaida izskatīšanu</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* In progress */}
      {inProgress.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-3">
            Progress uz bonusu
          </h2>
          <div className="grid gap-3">
            {inProgress.map(({ rule, result }) => (
              <Card key={rule.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm">{rule.name}</div>
                      {rule.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {rule.description}
                        </p>
                      )}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                          <span>{result.hours}h uzkrāts</span>
                          <span>
                            vēl {result.needed}h līdz {REWARD_LABELS[rule.rewardType as RewardType]}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${result.progressPercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>{result.progressPercent}%</span>
                          <span>
                            {rule.minimumHours}h / {PERIOD_LABELS[rule.periodType as PeriodType]}
                          </span>
                        </div>
                      </div>
                      {rule.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {rule.categories.map((c: string) => (
                            <Badge key={c} variant="outline">{c}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Badge variant="success" className="shrink-0">
                      {REWARD_LABELS[rule.rewardType as RewardType]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Locked (no progress) */}
      {locked.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-3 text-muted-foreground">
            Nepieejami (neatbilstoša loma vai kategorija)
          </h2>
          <div className="grid gap-3">
            {locked.map(({ rule }) => (
              <Card key={rule.id} className="opacity-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-sm">{rule.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {rule.minimumHours}h / {PERIOD_LABELS[rule.periodType as PeriodType]}
                      </div>
                    </div>
                    <Badge variant="muted">
                      {REWARD_LABELS[rule.rewardType as RewardType]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {rules.length === 0 && (
        <EmptyState
          icon={<Gift className="h-5 w-5" />}
          title="Nav aktīvu noteikumu"
          description="Jūsu vadītājs vēl nav izveidojis bonusu noteikumus."
        />
      )}

      {/* My request history */}
      {myRequests.length > 0 && (
        <section className="mt-4">
          <h2 className="text-base font-semibold mb-3">Manu pieprasījumu vēsture</h2>
          <div className="grid gap-3">
            {myRequests.map((req: any) => {
              const status = req.status as BonusRequestStatus;
              return (
                <Card key={req.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-sm">{req.rule.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {REWARD_LABELS[req.rewardType as RewardType]} ·{" "}
                          {formatDateLV(req.requestedAt)} · {req.hoursAccumulated}h uzkrāts
                        </div>
                        {req.managerComment && (
                          <div className="mt-2 rounded border border-border bg-muted/40 px-3 py-2 text-xs">
                            <span className="font-medium text-muted-foreground">
                              Vadītāja komentārs:{" "}
                            </span>
                            {req.managerComment}
                          </div>
                        )}
                      </div>
                      <Badge variant={BONUS_STATUS_TONE[status]}>
                        {BONUS_STATUS_LABELS[status]}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
