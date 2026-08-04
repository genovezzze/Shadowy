"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { setClientEmployees } from "@/app/manager/clients/actions";
import { Users } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
}

interface AssignEmployeesDialogProps {
  clientId: string;
  clientName: string;
  employees: Employee[];
  assignedIds: string[];
}

export function AssignEmployeesDialog({
  clientId,
  clientName,
  employees,
  assignedIds: initialAssigned,
}: AssignEmployeesDialogProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(initialAssigned));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await setClientEmployees(clientId, Array.from(selected));
      if (result.ok) {
        setOpen(false);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setSelected(new Set(initialAssigned));
        setError(null);
      }}
    >
      <Dialog.Trigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Users className="h-3.5 w-3.5" />
          Darbinieki ({initialAssigned.length})
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background border border-border rounded-xl shadow-xl p-6 w-full max-w-sm focus:outline-none">
          <Dialog.Title className="text-base font-semibold mb-1">
            Piešķirt darbiniekiem
          </Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mb-4">
            {clientName} - izvēlies, kuri darbinieki redz šo klientu.
          </Dialog.Description>

          {employees.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">Nav pievienotu darbinieku.</p>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              {employees.map((emp) => (
                <label
                  key={emp.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(emp.id)}
                    onChange={() => toggle(emp.id)}
                    className="h-4 w-4 rounded border-border accent-foreground"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium leading-snug">{emp.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{emp.email}</div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="mt-5 flex justify-between items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {selected.size} izvēlēti
            </span>
            <div className="flex gap-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" size="sm" disabled={pending}>
                  Atcelt
                </Button>
              </Dialog.Close>
              <Button size="sm" onClick={handleSave} disabled={pending}>
                {pending ? "Saglabā..." : "Saglabāt"}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
