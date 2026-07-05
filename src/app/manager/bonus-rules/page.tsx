import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RuleForm } from "./rule-form";
import { RuleCard } from "./rule-card";
import { Gift } from "lucide-react";

export default async function BonusRulesPage() {
  const session = await requireUser(["MANAGER", "ADMIN"]);

  const [rules, categories, workRoles] = await Promise.all([
    prisma.recognitionRule.findMany({
      where: { managerId: session.userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { name: "asc" },
    }),
    prisma.workRole.findMany({
      where: { managerId: session.userId },
      orderBy: { name: "asc" },
    }),
  ]);

  const categoryNames = categories.map((c: { name: string }) => c.name);
  const roleOptions = workRoles.map((r: { id: string; name: string }) => ({
    id: r.id,
    name: r.name,
  }));

  return (
    <>
      <PageHeader
        title="Atzinības noteikumi"
        description="Iestatiet noteikumus, pēc kuriem darbinieki var pretendēt uz bonusiem un atzinību."
      />

      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Jauns noteikums</CardTitle>
            </CardHeader>
            <CardContent>
              <RuleForm
                mode="create"
                categories={categoryNames}
                workRoles={roleOptions}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          {rules.length === 0 ? (
            <EmptyState
              icon={<Gift className="h-5 w-5" />}
              title="Nav izveidotu noteikumu"
              description="Izveidojiet pirmo noteikumu, lai darbinieki varētu pieteikties bonusiem."
            />
          ) : (
            <div className="grid gap-3">
              {rules.map((rule: any) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  categories={categoryNames}
                  workRoles={roleOptions}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
