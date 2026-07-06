"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addTimeLog } from "@/app/employee/history/actions";
import { Plus } from "lucide-react";

interface AddTimeButtonProps {
  entryId: string;
}

export function AddTimeButton({ entryId }: AddTimeButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const minutes = parseInt(fd.get("minutes") as string, 10);
    const comment = (fd.get("comment") as string).trim() || undefined;
    startTransition(async () => {
      const result = await addTimeLog({ entryId, minutes, comment });
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
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Pievienot laiku
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background border border-border rounded-xl shadow-xl p-6 w-full max-w-sm focus:outline-none">
          <Dialog.Title className="text-base font-semibold mb-1">
            Pievienot laiku
          </Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mb-4">
            Papildinājums tiks pieskaits kopējam ieraksta laikam.
          </Dialog.Description>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="add-time-minutes">Minūtes</Label>
              <Input
                id="add-time-minutes"
                name="minutes"
                type="number"
                min={1}
                max={1440}
                required
                autoFocus
                placeholder="piem., 30"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-time-comment">
                Komentārs <span className="text-muted-foreground">(neobligāts)</span>
              </Label>
              <Textarea
                id="add-time-comment"
                name="comment"
                maxLength={500}
                rows={2}
                placeholder="Ko papildināji vai kāpēc?"
              />
            </div>
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" disabled={pending}>
                  Atcelt
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={pending}>
                {pending ? "Saglabā..." : "Pievienot"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
