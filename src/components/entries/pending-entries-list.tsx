"use client";

import { useState, useTransition } from "react";
import { EntryCard } from "@/components/entries/entry-card";
import { ReviewActions } from "@/components/entries/review-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { ChevronDown, Pencil } from "lucide-react";
import { cn, formatDurationLV } from "@/lib/utils";
import { editEntry } from "@/app/manager/entries/actions";

export interface PendingEntry {
  id: string;
  employeeId: string;
  title: string;
  category: string;
  description: string;
  clientName?: string | null;
  workDate: string;
  durationMinutes: number;
  status: string;
  employeeName: string;
  workType: "in_role" | "extra" | "no_role";
}

type EmployeeGroup = {
  employeeId: string;
  employeeName: string;
  entries: PendingEntry[];
  totalMinutes: number;
  dateRange: string;
  categories: string[];
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function shortDateRange(entries: PendingEntry[]): string {
  const dates = [...new Set(entries.map((e) => e.workDate.slice(0, 10)))].sort();
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("lv-LV", { day: "numeric", month: "short" }).format(
      new Date(iso + "T12:00:00Z")
    );
  if (dates.length === 1) return fmt(dates[0]);
  return `${fmt(dates[0])} – ${fmt(dates[dates.length - 1])}`;
}

function groupByEmployee(entries: PendingEntry[]): EmployeeGroup[] {
  const map = new Map<string, EmployeeGroup>();
  for (const e of entries) {
    if (!map.has(e.employeeId)) {
      map.set(e.employeeId, {
        employeeId: e.employeeId,
        employeeName: e.employeeName,
        entries: [],
        totalMinutes: 0,
        dateRange: "",
        categories: [],
      });
    }
    const g = map.get(e.employeeId)!;
    g.entries.push(e);
    g.totalMinutes += e.durationMinutes;
    if (!g.categories.includes(e.category)) g.categories.push(e.category);
  }
  for (const g of map.values()) {
    g.dateRange = shortDateRange(g.entries);
  }
  return Array.from(map.values());
}

function pluralEntries(n: number) {
  if (n === 1) return "1 ieraksts";
  return `${n} ieraksti`;
}

type EditFields = { durationMinutes: string; clientName: string; category: string };

function GroupCard({ group }: { group: EmployeeGroup }) {
  const [expanded, setExpanded] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<EditFields>({
    durationMinutes: "",
    clientName: "",
    category: "",
  });
  const [isSaving, startSaving] = useTransition();
  const [editError, setEditError] = useState<string | null>(null);

  function openEdit(entry: PendingEntry) {
    setEditingEntryId(entry.id);
    setEditFields({
      durationMinutes: String(entry.durationMinutes),
      clientName: entry.clientName ?? "",
      category: entry.category,
    });
    setEditError(null);
  }

  function cancelEdit() {
    setEditingEntryId(null);
    setEditError(null);
  }

  function saveEdit() {
    if (!editingEntryId) return;
    const dur = parseInt(editFields.durationMinutes, 10);
    if (!dur || dur < 1 || dur > 1440) {
      setEditError("Laikam jābūt no 1 līdz 1440 minūtēm.");
      return;
    }
    if (!editFields.category.trim()) {
      setEditError("Kategorija nevar būt tukša.");
      return;
    }
    startSaving(async () => {
      const res = await editEntry({
        entryId: editingEntryId,
        durationMinutes: dur,
        clientName: editFields.clientName.trim() || null,
        category: editFields.category.trim(),
      });
      if (res.ok) {
        setEditingEntryId(null);
        setEditError(null);
      } else {
        setEditError(res.error);
      }
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shrink-0 select-none">
            {initials(group.employeeName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm leading-snug">{group.employeeName}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {pluralEntries(group.entries.length)} · {formatDurationLV(group.totalMinutes)} ·{" "}
              {group.dateRange}
            </div>
            {group.categories.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {group.categories.slice(0, 3).map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {cat}
                  </span>
                ))}
                {group.categories.length > 3 && (
                  <span className="py-0.5 text-xs text-muted-foreground">
                    +{group.categories.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              expanded && "bg-muted text-foreground"
            )}
          >
            Pārskatīt
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                expanded && "rotate-180"
              )}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border">
          <div className="divide-y divide-border">
            {group.entries.map((e) => (
              <div key={e.id} className="p-4">
                <EntryCard
                  title={e.title}
                  category={e.category}
                  description={e.description}
                  clientName={e.clientName}
                  workDate={new Date(e.workDate)}
                  durationMinutes={e.durationMinutes}
                  status={e.status as "PENDING"}
                  workType={e.workType}
                  footer={
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <ReviewActions entryId={e.id} />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            editingEntryId === e.id ? cancelEdit() : openEdit(e)
                          }
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          {editingEntryId === e.id ? "Atcelt" : "Labot"}
                        </Button>
                      </div>

                      {editingEntryId === e.id && (
                        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <Label
                                htmlFor={`dur-${e.id}`}
                                className="text-xs font-medium"
                              >
                                Laiks (min.)
                              </Label>
                              <Input
                                id={`dur-${e.id}`}
                                type="number"
                                min={1}
                                max={1440}
                                value={editFields.durationMinutes}
                                onChange={(ev) =>
                                  setEditFields((f) => ({
                                    ...f,
                                    durationMinutes: ev.target.value,
                                  }))
                                }
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label
                                htmlFor={`client-${e.id}`}
                                className="text-xs font-medium"
                              >
                                Klients / uzņēmums
                              </Label>
                              <Input
                                id={`client-${e.id}`}
                                value={editFields.clientName}
                                onChange={(ev) =>
                                  setEditFields((f) => ({
                                    ...f,
                                    clientName: ev.target.value,
                                  }))
                                }
                                placeholder="Nav norādīts"
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label
                              htmlFor={`cat-${e.id}`}
                              className="text-xs font-medium"
                            >
                              Kategorija
                            </Label>
                            <Input
                              id={`cat-${e.id}`}
                              value={editFields.category}
                              onChange={(ev) =>
                                setEditFields((f) => ({
                                  ...f,
                                  category: ev.target.value,
                                }))
                              }
                              className="h-8 text-sm"
                            />
                          </div>
                          {editError && (
                            <p className="text-xs text-destructive">{editError}</p>
                          )}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={saveEdit}
                              disabled={isSaving}
                            >
                              {isSaving ? "Saglabā..." : "Saglabāt"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEdit}
                              disabled={isSaving}
                            >
                              Atcelt
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function PendingEntriesList({ entries }: { entries: PendingEntry[] }) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="Nav jaunu ierakstu"
        description="Kad darbinieki iesniegs jaunus ierakstus, tie parādīsies šeit."
      />
    );
  }

  const groups = groupByEmployee(entries);

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <GroupCard key={group.employeeId} group={group} />
      ))}
    </div>
  );
}
