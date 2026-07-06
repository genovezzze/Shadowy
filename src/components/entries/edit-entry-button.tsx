"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateEntry } from "@/app/employee/history/actions";
import { SMART_LOG_CATEGORIES } from "@/lib/smart-log";
import { Pencil } from "lucide-react";

interface EditEntryButtonProps {
  entryId: string;
  title: string;
  category: string;
  description: string;
  workDate: string;
  durationMinutes: number;
}

export function EditEntryButton({
  entryId,
  title,
  category,
  description,
  workDate,
  durationMinutes,
}: EditEntryButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const today = new Date().toISOString().slice(0, 10);

  function handleEdit(formData: FormData) {
    setError(null);
    formData.set("entryId", entryId);
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
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background border border-border rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto focus:outline-none">
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
                    {SMART_LOG_CATEGORIES.map(({ value, label }) => (
                      <SelectItem key={value} value={label}>{label}</SelectItem>
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
              <Label htmlFor="edit-duration">Ilgums (minūtēs)</Label>
              <Input
                id="edit-duration"
                name="durationMinutes"
                type="number"
                min={1}
                max={1440}
                required
                defaultValue={durationMinutes}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Apraksts</Label>
              <Textarea
                id="edit-description"
                name="description"
                required
                minLength={10}
                maxLength={2000}
                defaultValue={description}
                rows={4}
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
