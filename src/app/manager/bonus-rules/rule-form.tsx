"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { createRule, updateRule } from "./actions";
import { REWARD_LABELS, PERIOD_LABELS, REWARD_TYPES, PERIOD_TYPES } from "@/lib/reward-types";
import type { RewardType, PeriodType } from "@/lib/reward-types";

interface RuleFormProps {
  mode: "create" | "edit";
  ruleId?: string;
  initial?: {
    name: string;
    description: string;
    minimumHours: number;
    periodType: PeriodType;
    rewardType: RewardType;
    categories: string[];
    workRoleIds: string[];
    oneTimePerPeriod: boolean;
  };
  categories: string[];
  workRoles: { id: string; name: string }[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RuleForm({
  mode,
  ruleId,
  initial,
  categories,
  workRoles,
  onSuccess,
  onCancel,
}: RuleFormProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initial?.categories ?? []
  );
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    initial?.workRoleIds ?? []
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggleItem(list: string[], item: string): string[] {
    return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    selectedCategories.forEach((c) => formData.append("categories", c));
    selectedRoles.forEach((r) => formData.append("workRoleIds", r));

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createRule(formData)
          : await updateRule(ruleId!, formData);
      if (!result.ok) {
        setError(result.error);
      } else {
        onSuccess?.();
      }
    });
  }

  return (
    <form action={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="rule-name">Nosaukums</Label>
        <Input
          id="rule-name"
          name="name"
          required
          maxLength={100}
          placeholder="piemēram, Mentoringa bonuss"
          defaultValue={initial?.name}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="rule-desc">Apraksts (neobligāts)</Label>
        <Textarea
          id="rule-desc"
          name="description"
          maxLength={500}
          rows={2}
          placeholder="Īss skaidrojums darbiniekiem"
          defaultValue={initial?.description}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="rule-hours">Min. stundas</Label>
          <Input
            id="rule-hours"
            name="minimumHours"
            type="number"
            step="0.5"
            min="0.5"
            max="500"
            required
            defaultValue={initial?.minimumHours ?? 8}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="rule-period">Periods</Label>
          <NativeSelect
            id="rule-period"
            name="periodType"
            required
            defaultValue={initial?.periodType ?? "MONTH"}
          >
            {PERIOD_TYPES.map((p) => (
              <option key={p} value={p}>
                {PERIOD_LABELS[p]}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="rule-reward">Bonusa veids</Label>
        <NativeSelect
          id="rule-reward"
          name="rewardType"
          required
          defaultValue={initial?.rewardType ?? "PAID_DAY_OFF"}
        >
          {REWARD_TYPES.map((r) => (
            <option key={r} value={r}>
              {REWARD_LABELS[r as RewardType]}
            </option>
          ))}
        </NativeSelect>
      </div>

      {categories.length > 0 && (
        <div className="grid gap-2">
          <Label>
            Kategorijas{" "}
            <span className="text-xs text-muted-foreground font-normal">
              (tukšs = visas)
            </span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCategories((prev) => toggleItem(prev, c))}
                className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                  selectedCategories.includes(c)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted/30 text-muted-foreground hover:border-border/80"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {workRoles.length > 0 && (
        <div className="grid gap-2">
          <Label>
            Lomas{" "}
            <span className="text-xs text-muted-foreground font-normal">
              (tukšs = visas lomas)
            </span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {workRoles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRoles((prev) => toggleItem(prev, r.id))}
                className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                  selectedRoles.includes(r.id)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted/30 text-muted-foreground hover:border-border/80"
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <input
          id="rule-otp"
          name="oneTimePerPeriod"
          type="checkbox"
          value="true"
          defaultChecked={initial?.oneTimePerPeriod ?? true}
          className="h-4 w-4 rounded border border-border bg-background accent-primary"
        />
        <Label htmlFor="rule-otp" className="cursor-pointer font-normal text-sm">
          Izmantojams tikai vienu reizi periodā
        </Label>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={pending}>
            Atcelt
          </Button>
        )}
        <Button type="submit" size="sm" disabled={pending}>
          {pending
            ? "Saglabā..."
            : mode === "create"
            ? "Izveidot noteikumu"
            : "Saglabāt izmaiņas"}
        </Button>
      </div>
    </form>
  );
}
