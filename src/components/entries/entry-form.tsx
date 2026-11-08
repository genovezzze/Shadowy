"use client";

import { useState, useTransition } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ClientCombobox } from "@/components/ui/client-combobox";
import { DurationInput } from "@/components/entries/duration-input";
import { NoClientsNotice } from "@/components/entries/no-clients-notice";
import { createEntry } from "@/app/employee/new-entry/actions";
import { SMART_LOG_CATEGORIES, type SmartLogCategoryDef } from "@/lib/smart-log";
import { WORK_NATURE_FLAGS } from "@/lib/work-nature";
import { APPLE_FIELD, APPLE_FILL, APPLE_PRIMARY_BUTTON, METRIC_SURFACE } from "@/components/dashboard/apple";
import { DateInput, localToday } from "@/components/ui/date-input";

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

  const today = localToday();
  const label = "text-[14px] font-medium";
  // Compact on short screens so the form fits without scrolling; roomy once
  // the window is tall enough (the tall variant is keyed on viewport height).
  const field = cn(APPLE_FIELD, "h-10 px-3.5 text-[15px] [@media(min-height:1000px)]:h-12 [@media(min-height:1000px)]:px-4 [@media(min-height:1000px)]:text-[16px]");

  return (
    <div className={cn(METRIC_SURFACE, "flex flex-1 flex-col p-4 sm:p-5")}>
        <form
          id="entry-form"
          action={onSubmit}
          className="flex flex-1 flex-col gap-3 [@media(min-height:1000px)]:gap-5"
        >
          {/* Fixed-height fields; the description below takes the remaining height. */}
          <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2 [@media(min-height:1000px)]:gap-y-5">
          {initialValues ? (
            <div className={cn(APPLE_FILL, "rounded-xl px-4 py-2.5 text-[13px] text-muted-foreground sm:col-span-2")}>
              Lauki aizpildīti no iepriekšējā ieraksta - pārbaudiet un pielāgojiet pirms iesniegšanas.
            </div>
          ) : null}

          <div className="grid gap-1.5 [@media(min-height:1000px)]:gap-2 sm:col-span-2">
            <Label htmlFor="title" className={label}>Nosaukums</Label>
            <Input
              className={field}
              id="title"
              name="title"
              required
              maxLength={120}
              defaultValue={initialValues?.title}
              placeholder="Īsi aprakstiet, ko paveicāt"
            />
          </div>

          <div className="grid gap-1.5 [@media(min-height:1000px)]:gap-2">
            <Label htmlFor="category" className={label}>Kategorija</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className={field}>
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

          <div className="grid gap-1.5 [@media(min-height:1000px)]:gap-2">
            <Label className={label}>Klients</Label>
            {clients.length > 0 ? (
              <ClientCombobox
                clients={clients}
                value={clientId}
                onChange={setClientId}
                className={field}
              />
            ) : (
              <>
                <NoClientsNotice />
                <Input
                  className={field}
                  id="clientName"
                  name="clientName"
                  maxLength={120}
                  defaultValue={initialValues?.clientName ?? undefined}
                  placeholder="Ierakstiet klienta nosaukumu"
                />
              </>
            )}
          </div>

          {/* Date and duration share a row: the date is narrow, the duration
              keeps its quick-pick chips on the same line. */}
          <div className="grid gap-x-5 gap-y-3 sm:col-span-2 sm:grid-cols-[200px_1fr] [@media(min-height:1000px)]:gap-y-5">
            <div className="grid gap-1.5 [@media(min-height:1000px)]:gap-2">
              <Label htmlFor="workDate" className={label}>Darba datums</Label>
              <DateInput
                className={field}
                id="workDate"
                name="workDate"
                required
                defaultValue={today}
                max={today}
              />
            </div>
            <div className="grid gap-1.5 [@media(min-height:1000px)]:gap-2">
              <Label htmlFor="durationMinutes" className={label}>Ilgums</Label>
              <DurationInput
                apple
                id="durationMinutes"
                name="durationMinutes"
                defaultMinutes={initialValues?.durationMinutes}
              />
            </div>
          </div>

          </div>

          <div className="flex flex-1 flex-col gap-1.5 [@media(min-height:1000px)]:gap-2">
            <Label htmlFor="description" className={label}>
              Apraksts <span className="font-normal text-muted-foreground">(nav obligāts)</span>
            </Label>
            <Textarea
              className={cn(APPLE_FIELD, "h-auto min-h-[64px] flex-1 resize-none px-3.5 py-2.5 text-[15px] [@media(min-height:1000px)]:min-h-[96px] [@media(min-height:1000px)]:px-4 [@media(min-height:1000px)]:py-3 [@media(min-height:1000px)]:text-[16px]")}
              rows={2}
              id="description"
              name="description"
              maxLength={2000}
              defaultValue={initialValues?.description}
              placeholder="Pastāstiet vairāk: kam palīdzējāt, kāds bija konteksts, kāpēc tas bija nepieciešams."
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-[14px] text-destructive sm:col-span-2">
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="rounded-xl border border-[#34C759]/30 bg-[#34C759]/10 px-4 py-2.5 text-[14px] text-[#248A3D] dark:text-[#30D158] sm:col-span-2">
              Ieraksts ir iesniegts vadītājam.
            </div>
          ) : null}

          {/* Footer: the help flag on the left, the submit on the right. */}
          <div className="flex flex-col gap-3 pt-1 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
              <label className="flex cursor-pointer items-center gap-2.5" title={HELP_FLAG.hint}>
                <input
                  type="checkbox"
                  checked={helpedColleague}
                  onChange={(event) => setHelpedColleague(event.target.checked)}
                  className="h-4 w-4 shrink-0 accent-[#007AFF]"
                />
                <span className="text-[15px] font-medium">{HELP_FLAG.label}</span>
              </label>
              {helpedColleague && colleagues.length > 0 ? (
                <Select value={helpedUserId} onValueChange={setHelpedUserId}>
                  <SelectTrigger id="helpedUserId" aria-label="Kam palīdzējāt?" className={cn(field, "h-10 w-64 text-[14px]")}>
                    <SelectValue placeholder="Kam palīdzējāt? (neobligāti)" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleagues.map((colleague) => (
                      <SelectItem key={colleague.id} value={colleague.id}>
                        {colleague.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
            </div>
            <button type="submit" disabled={pending} className={cn(APPLE_PRIMARY_BUTTON, "h-10 px-6 text-[15px] [@media(min-height:1000px)]:h-12 [@media(min-height:1000px)]:px-7 [@media(min-height:1000px)]:text-[16px]")}>
              {pending ? "Iesniedz..." : "Iesniegt vadītājam"}
            </button>
          </div>
        </form>
    </div>
  );
}
