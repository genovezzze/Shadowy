"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { deleteEntry } from "@/app/employee/history/actions";
import { Trash2 } from "lucide-react";

export function DeleteEntryButton({ entryId }: { entryId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteEntry(entryId);
      setOpen(false);
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background border border-border rounded-xl shadow-xl p-6 w-full max-w-sm focus:outline-none">
          <Dialog.Title className="text-base font-semibold mb-2">Dzēst ierakstu?</Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mb-6">
            Šī darbība ir neatgriezeniska. Ieraksts tiks neatgriezeniski izdzēsts.
          </Dialog.Description>
          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="outline" disabled={pending}>Atcelt</Button>
            </Dialog.Close>
            <Button variant="destructive" onClick={handleDelete} disabled={pending}>
              {pending ? "Dzēš..." : "Jā, dzēst"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
