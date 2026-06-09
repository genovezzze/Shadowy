"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RuleForm } from "./rule-form";
import { toggleRule, deleteRule } from "./actions";
import { REWARD_LABELS, PERIOD_LABELS } from "@/lib/reward-types";
import type { RewardType, PeriodType } from "@/lib/reward-types";

interface RuleCardProps {
  rule: {
    id: string;
    name: string;
    description: string | null;
    minimumHours: number;
    periodType: string;
    rewardType: string;
    categories: string[];
    workRoleIds: string[];
    oneTimePerPeriod: boolean;
    isActive: boolean;
  };
  categories: string[];
  workRoles: { id: string; name: string }[];
}

export function RuleCard({ rule, categories, workRoles }: RuleCardProps) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(() => toggleRule(rule.id, !rule.isActive));
  }

  function handleDelete() {
    if (!confirm(`Dzēst noteikumu "${rule.name}"?`)) return;
    startTransition(() => deleteRule(rule.id));
  }

  const roleNames = rule.workRoleIds
    .map((id) => workRoles.find((r) => r.id === id)?.name)
    .filter(Boolean);

  if (editing) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="text-sm font-medium mb-4">Rediģēt noteikumu</div>
          <RuleForm
            mode="edit"
            ruleId={rule.id}
            initial={{
              name: rule.name,
              description: rule.description ?? "",
              minimumHours: rule.minimumHours,
              periodType: rule.periodType as PeriodType,
              rewardType: rule.rewardType as RewardType,
              categories: rule.categories,
              workRoleIds: rule.workRoleIds,
              oneTimePerPeriod: rule.oneTimePerPeriod,
            }}
            categories={categories}
            workRoles={workRoles}
            onSuccess={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={rule.isActive ? "" : "opacity-60"}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{rule.name}</span>
              {!rule.isActive && (
                <Badge variant="muted">Neaktīvs</Badge>
              )}
            </div>
            {rule.description && (
              <p className="text-xs text-muted-foreground mt-1">{rule.description}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-3">
              <Badge variant="default">
                {rule.minimumHours}h / {PERIOD_LABELS[rule.periodType as PeriodType]}
              </Badge>
              <Badge variant="success">
                {REWARD_LABELS[rule.rewardType as RewardType]}
              </Badge>
              {rule.categories.length > 0 &&
                rule.categories.map((c) => (
                  <Badge key={c} variant="outline">{c}</Badge>
                ))}
              {roleNames.map((n) => (
                <Badge key={n} variant="outline">{n}</Badge>
              ))}
              {rule.oneTimePerPeriod && (
                <Badge variant="muted">1× periodā</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              disabled={pending}
              className="text-xs"
            >
              {rule.isActive ? "Deaktivēt" : "Aktivēt"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              Rediģēt
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={pending}
              className="text-destructive hover:text-destructive"
            >
              Dzēst
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
