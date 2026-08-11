"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ClientCombobox } from "@/components/ui/client-combobox";
import { createEntry } from "@/app/employee/new-entry/actions";
import { CATEGORY_GROUPS, SMART_LOG_CATEGORIES } from "@/lib/smart-log";
import { WORK_NATURE_FLAGS } from "@/lib/work-nature";

const HELP_FLAG = WORK_NATURE_FLAGS[0];

interface ClientOption {
  id: string;
  name: string;
}

interface ColleagueOption {
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
  colleagues = [],
  initialValues,
}: {
  clients?: ClientOption[];
  colleagues?: ColleagueOption[];
  initialValues?: EntryFormInitialValues;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [category, setCategory] = useState(initialValues?.category ?? "");
  const [clientId, setClientId] = useState(initialValues?.clientId ?? "");
  const [helpedColleague, setHelpedColleague] = useState(false);
  const [helpedUserId, setHelpedUserId] = useState("");

  async function onSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    formData.set("category", category);
    if (clientId && clientId !== "__none__") formData.set("clientId", clientId);
    formData.set("helpedColleague", helpedColleague ? "on" : "");
    // Only meaningful while the flag is set - unticking it must not leave a
    // stale recipient behind on the entry.
    if (helpedColleague && helpedUserId) {
      formData.set("helpedUserId", helpedUserId);
    }
    startTransition(async () => {
      const result = await createEntry(formData);
      if (!result.ok) {
        setError(result.error);
      } else {
        setSuccess(true);
        setCategory("");
        setClientId("");
        setHelpedColleague(false);
        setHelpedUserId("");
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
                  {CATEGORY_GROUPS.map((group) => (
                    <SelectGroup key={group}>
                      <SelectLabel>{group}</SelectLabel>
                      {SMART_LOG_CATEGORIES.filter((c) => c.group === group).map(
                        ({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectGroup>
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

          <div className="grid gap-3 rounded-lg border border-border bg-muted/20 p-4">
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={helpedColleague}
                onChange={(event) => setHelpedColleague(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-500"
              />
              <span className="min-w-0">
                <span className="block text-sm leading-tight">
                  {HELP_FLAG.label}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {HELP_FLAG.hint}
                </span>
              </span>
            </label>
            {helpedColleague && colleagues.length > 0 ? (
              <div className="grid gap-2 border-t border-border/60 pt-3">
                <Label htmlFor="helpedUserId" className="text-xs">
                  Kam palīdzējāt?{" "}
                  <span className="text-muted-foreground">(neobligāti)</span>
                </Label>
                <Select value={helpedUserId} onValueChange={setHelpedUserId}>
                  <SelectTrigger id="helpedUserId">
                    <SelectValue placeholder="Izvēlieties kolēģi" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleagues.map((colleague) => (
                      <SelectItem key={colleague.id} value={colleague.id}>
                        {colleague.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
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
