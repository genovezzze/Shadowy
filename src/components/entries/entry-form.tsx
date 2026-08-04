"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ClientCombobox } from "@/components/ui/client-combobox";
import { createEntry } from "@/app/employee/new-entry/actions";
import { SMART_LOG_CATEGORIES } from "@/lib/smart-log";

interface ClientOption {
  id: string;
  name: string;
}

interface EntryFormInitialValues {
  title?: string;
  category?: string;
  description?: string;
  durationMinutes?: number;
  clientId?: string | null;
  clientName?: string | null;
}

export function EntryForm({
  clients = [],
  initialValues,
}: {
  clients?: ClientOption[];
  initialValues?: EntryFormInitialValues;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [category, setCategory] = useState(initialValues?.category ?? "");
  const [clientId, setClientId] = useState(initialValues?.clientId ?? "");

  async function onSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    formData.set("category", category);
    if (clientId && clientId !== "__none__") formData.set("clientId", clientId);
    startTransition(async () => {
      const result = await createEntry(formData);
      if (!result.ok) {
        setError(result.error);
      } else {
        setSuccess(true);
        setCategory("");
        setClientId("");
        (document.getElementById("entry-form") as HTMLFormElement)?.reset();
      }
    });
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Card>
      <CardContent className="p-6">
        <form
          id="entry-form"
          action={onSubmit}
          className="grid grid-cols-1 gap-5"
        >
          {initialValues ? (
            <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              Lauki aizpildīti no iepriekšējā ieraksta - pārbaudiet un pielāgojiet pirms iesniegšanas.
            </div>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="title">Nosaukums</Label>
            <Input
              id="title"
              name="title"
              required
              maxLength={120}
              defaultValue={initialValues?.title}
              placeholder="Īsi aprakstiet, ko paveicāt"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="category">Kategorija</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Izvēlieties kategoriju" />
                </SelectTrigger>
                <SelectContent>
                  {SMART_LOG_CATEGORIES.map(({ value, label }) => (
                    <SelectItem key={value} value={label}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="workDate">Darba datums</Label>
              <Input
                id="workDate"
                name="workDate"
                type="date"
                required
                defaultValue={today}
                max={today}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Klients</Label>
            {clients.length > 0 ? (
              <ClientCombobox
                clients={clients}
                value={clientId}
                onChange={setClientId}
              />
            ) : (
              <Input
                id="clientName"
                name="clientName"
                maxLength={120}
                defaultValue={initialValues?.clientName ?? undefined}
                placeholder="Neobligāti"
              />
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="durationMinutes">Ilgums (minūtēs)</Label>
            <Input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              min={1}
              max={1440}
              required
              defaultValue={initialValues?.durationMinutes}
              placeholder="piem., 30"
            />
            <p className="text-xs text-muted-foreground">
              Norādiet aptuveno laiku, kas tika veltīts šim neredzamajam darbam.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Apraksts</Label>
            <Textarea
              id="description"
              name="description"
              required
              minLength={10}
              maxLength={2000}
              defaultValue={initialValues?.description}
              placeholder="Pastāstiet vairāk: kam palīdzējāt, kāds bija konteksts, kāpēc tas bija nepieciešams."
            />
          </div>

          {error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="rounded-md border border-success/30 bg-success/5 px-3 py-2 text-sm text-success">
              Ieraksts ir iesniegts vadītājam.
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Iesniedz..." : "Iesniegt vadītājam"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
