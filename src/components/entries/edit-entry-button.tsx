"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClientCombobox } from "@/components/ui/client-combobox";
import { DurationInput } from "@/components/entries/duration-input";
import { updateEntry } from "@/app/employee/history/actions";
import { SMART_LOG_CATEGORIES, categoryDisplay, type SmartLogCategoryDef } from "@/lib/smart-log";
import { categoryLabel, normalizeCategoryKey } from "@/lib/work-insights";
import { Pencil } from "lucide-react";

interface ClientOption {
  id: string;
  name: string;
}

interface EditEntryButtonProps {
  entryId: string;
  title: string;
  category: string;
  description: string;
  workDate: string;
  durationMinutes: number;
  clients?: ClientOption[];
  clientId?: string | null;
  clientName?: string | null;
  categories?: readonly SmartLogCategoryDef[];
}

export function EditEntryButton({
  entryId,
  title,
  category,
  description,
  workDate,
  durationMinutes,
  clients = [],
  clientId,
  clientName,
  categories = SMART_LOG_CATEGORIES,
}: EditEntryButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [selectedClientId, setSelectedClientId] = useState(clientId ?? "");

  const today = new Date().toISOString().slice(0, 10);

  // The selectable set is role-scoped and categories can be retired, so an older
  // entry may hold a category that is no longer in the list. Keep it as an extra
  // option (with a human label) so it stays selected and is not lost on save.
  const categoryInList = categories.some((c) => c.label === category);
  const missingCategoryLabel = categoryInList
    ? null
    : categoryLabel(normalizeCategoryKey(category));

  function handleEdit(formData: FormData) {
    setError(null);
    formData.set("entryId", entryId);
    if (selectedClientId && selectedClientId !== "__none__") {
      formData.set("clientId", selectedClientId);
    }
    startTransition(async () => {
      const result = await updateEntry(formData);
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
          <Pencil className="h-3.5 w-3.5" />
          Rediģēt
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background border border-border rounded-xl shadow-xl p-6 sm:p-8 w-[min(94vw,42rem)] max-w-[94vw] max-h-[90vh] overflow-y-auto focus:outline-none">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Rediģēt ierakstu
          </Dialog.Title>
          <form action={handleEdit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Nosaukums</Label>
              <Input id="edit-title" name="title" required maxLength={120} defaultValue={title} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Kategorija</Label>
                <Select name="category" required defaultValue={category}>
                  <SelectTrigger id="edit-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {missingCategoryLabel && category ? (
                      <SelectItem value={category}>{missingCategoryLabel}</SelectItem>
                    ) : null}
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.label}>{categoryDisplay(c)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-workDate">Darba datums</Label>
                <Input
                  id="edit-workDate"
                  name="workDate"
                  type="date"
                  required
                  defaultValue={workDate}
                  max={today}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Klients</Label>
              {clients.length > 0 ? (
                <ClientCombobox
                  clients={clients}
                  value={selectedClientId}
                  onChange={setSelectedClientId}
                />
              ) : (
                <Input
                  id="edit-clientName"
                  name="clientName"
                  maxLength={120}
                  defaultValue={clientName ?? ""}
                  placeholder="Neobligāti"
                />
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-duration">Ilgums</Label>
              <DurationInput
                id="edit-duration"
                name="durationMinutes"
                defaultMinutes={durationMinutes}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">
                Apraksts <span className="text-muted-foreground">(nav obligāts)</span>
              </Label>
              <Textarea
                id="edit-description"
                name="description"
                maxLength={2000}
                defaultValue={description}
                rows={5}
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
                {pending ? "Saglabā..." : "Saglabāt izmaiņas"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
