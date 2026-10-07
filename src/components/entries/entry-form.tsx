"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClientCombobox } from "@/components/ui/client-combobox";
import { DurationInput } from "@/components/entries/duration-input";
import { NoClientsNotice } from "@/components/entries/no-clients-notice";
import { createEntry } from "@/app/employee/new-entry/actions";
import { SMART_LOG_CATEGORIES, type SmartLogCategoryDef } from "@/lib/smart-log";
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
  categories = SMART_LOG_CATEGORIES,
}: {
  clients?: ClientOption[];
  colleagues?: ColleagueOption[];
  initialValues?: EntryFormInitialValues;
  categories?: readonly SmartLogCategoryDef[];
}) {
  // Group labels in the order they first appear in the given set.
  const categoryGroups = Array.from(new Set(categories.map((c) => c.group)));
  // When more than one group is available (the assistant sees both), the
  // dropdown shows tab buttons and only the active group's categories.
  const [categoryTab, setCategoryTab] = useState(categoryGroups[0] ?? "");
  const activeGroup = categoryGroups.includes(categoryTab)
    ? categoryTab
    : categoryGroups[0];
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
                <SelectContent className="w-auto max-w-[min(94vw,720px)]">
                  {/* Tabs: only when more than one group is available (the
                      assistant). Clicking a tab reveals that group's
                      categories. onPointerDown so the select does not treat it
                      as an item selection or close. */}
                  {categoryGroups.length > 1 && (
                    <div className="mb-1 flex gap-1 border-b border-border p-1">
                      {categoryGroups.map((group) => (
                        <button
                          key={group}
                          type="button"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCategoryTab(group);
                          }}
                          className={cn(
                            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                            activeGroup === group
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:bg-muted/50",
                          )}
                        >
                          {group}
                        </button>
                      ))}
                    </div>
                  )}
                  <SelectGroup>
                    {/* Columns of five. Every row is the same height (fits a
                        two-line label) so the spacing stays even; the number is
                        a right-aligned muted prefix so labels line up. */}
                    <div
                      className={cn(
                        "grid grid-flow-col",
                        activeGroup === "Grāmatvežu palīgs"
                          ? "grid-rows-4"
                          : "grid-rows-5",
                      )}
                    >
                      {categories
                        .filter((c) => c.group === activeGroup)
                        .map((c) => (
                          <SelectItem
                            key={c.value}
                            value={c.value}
                            className="min-h-[46px] items-center py-0 pl-6 pr-3 text-[13px]"
                          >
                            <span className="flex min-w-0 items-baseline gap-2">
                              {c.code && (
                                <>
                                  <span className="w-4 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                                    {c.code}
                                  </span>
                                  <span className="text-muted-foreground/40">|</span>
                                </>
                              )}
                              <span className="min-w-0 leading-snug">{c.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                    </div>
                  </SelectGroup>
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
              <>
                <NoClientsNotice />
                <Input
                  id="clientName"
                  name="clientName"
                  maxLength={120}
                  defaultValue={initialValues?.clientName ?? undefined}
                  placeholder="Ierakstiet klienta nosaukumu"
                />
              </>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="durationMinutes">Ilgums</Label>
            <DurationInput
              id="durationMinutes"
              name="durationMinutes"
              defaultMinutes={initialValues?.durationMinutes}
            />
            <p className="text-xs text-muted-foreground">
              Norādiet aptuveno laiku, kas tika veltīts šim darbam.
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
            <Label htmlFor="description">
              Apraksts <span className="text-muted-foreground">(nav obligāts)</span>
            </Label>
            <Textarea
              id="description"
              name="description"
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
