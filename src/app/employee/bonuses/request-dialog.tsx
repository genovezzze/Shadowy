"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitBonusRequest } from "./actions";
import { REWARD_LABELS } from "@/lib/reward-types";
import type { RewardType } from "@/lib/reward-types";

interface RequestDialogProps {
  rule: {
    id: string;
    name: string;
    rewardType: string;
  };
  hoursAccumulated: number;
}

export function RequestDialog({ rule, hoursAccumulated }: RequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("ruleId", rule.id);
    formData.set("hoursAccumulated", String(hoursAccumulated));
    startTransition(async () => {
      const result = await submitBonusRequest(formData);
      if (!result.ok) {
        setError(result.error);
      } else {
        setOpen(false);
      }
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { setOpen(o); setError(null); }}>
      <Dialog.Trigger asChild>
        <Button size="sm">Pieprasīt</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background border border-border rounded-xl shadow-xl p-6 w-full max-w-md focus:outline-none">
          <Dialog.Title className="text-base font-semibold mb-1">
            Iesniegt bonusa pieprasījumu
          </Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mb-4">
            {rule.name} · {REWARD_LABELS[rule.rewardType as RewardType]}
          </Dialog.Description>
          <form action={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="emp-comment">
                Komentārs{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  (neobligāts)
                </span>
              </Label>
              <Textarea
                id="emp-comment"
                name="employeeComment"
                rows={3}
                maxLength={1000}
                placeholder="Paskaidrojiet, kāpēc uzskatāt, ka atbilstat nosacījumiem..."
              />
            </div>
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" disabled={pending}>
                  Atcelt
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={pending}>
                {pending ? "Iesniedz..." : "Iesniegt pieprasījumu"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
