"use client";

import { useState, useTransition } from "react";
import { EntryCard } from "@/components/entries/entry-card";
import { ReviewActions } from "@/components/entries/review-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { Check, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { bulkReviewEntries } from "@/app/manager/entries/actions";

export interface PendingEntry {
  id: string;
  title: string;
  category: string;
  description: string;
  workDate: string;
  durationMinutes: number;
  status: string;
  employeeName: string;
  workType: "in_role" | "extra" | "no_role";
}

export function PendingEntriesList({ entries }: { entries: PendingEntry[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState<"idle" | "reject" | "return">("idle");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allSelected = selected.size === entries.length && entries.length > 0;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) clearSelection();
    else setSelected(new Set(entries.map((e) => e.id)));
  }

  function clearSelection() {
    setSelected(new Set());
    setBulkMode("idle");
    setComment("");
    setError(null);
  }

  function bulkAct(action: "APPROVE" | "REJECT" | "RETURN") {
    setError(null);
    startTransition(async () => {
      const res = await bulkReviewEntries({ entryIds: Array.from(selected), action, comment });
      if (!res.ok) setError(res.error);
      else clearSelection();
    });
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        title="Nav ierakstu, kas gaida izskatīšanu"
        description="Kad darbinieki iesniegs jaunus ierakstus, tie parādīsies šeit."
      />
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-3 px-1">
        <label className="flex items-center gap-2.5 cursor-pointer select-none group">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} className="sr-only" />
          <div className={cn(
            "h-[18px] w-[18px] rounded-[5px] border-2 flex items-center justify-center transition-all duration-150 shrink-0",
            allSelected
              ? "bg-emerald-500 border-emerald-500"
              : "border-muted-foreground/30 bg-background group-hover:border-muted-foreground/60"
          )}>
            {allSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
          </div>
          <span className="text-xs text-muted-foreground">
            {allSelected ? "Noņemt atlasi" : "Atlasīt visus"}
          </span>
        </label>
        {selected.size > 0 && (
          <span className="text-xs text-muted-foreground">
            {selected.size} no {entries.length} atlasīti
          </span>
        )}
      </div>

      <div className="grid gap-4">
        {entries.map((e) => (
          <div
            key={e.id}
            className={cn(
              "relative transition-colors duration-150 rounded-xl",
              selected.has(e.id) ? "bg-emerald-500/[0.06]" : ""
            )}
          >
            {/* Custom checkbox */}
            <label className="absolute top-[18px] left-5 z-10 cursor-pointer group">
              <input
                type="checkbox"
                checked={selected.has(e.id)}
                onChange={() => toggle(e.id)}
                className="sr-only"
              />
              <div className={cn(
                "h-[18px] w-[18px] rounded-[5px] border-2 flex items-center justify-center transition-all duration-150 shadow-sm",
                selected.has(e.id)
                  ? "bg-emerald-500 border-emerald-500"
                  : "border-muted-foreground/25 bg-background group-hover:border-muted-foreground/50"
              )}>
                {selected.has(e.id) && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </div>
            </label>
            <div className="pl-11">
              <EntryCard
                title={e.title}
                category={e.category}
                description={e.description}
                workDate={new Date(e.workDate)}
                durationMinutes={e.durationMinutes}
                status={e.status as "PENDING"}
                employeeName={e.employeeName}
                workType={e.workType}
                footer={<ReviewActions entryId={e.id} />}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Floating bulk action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-none">
          <div className="rounded-2xl border border-border bg-background/95 backdrop-blur-md shadow-2xl p-4 pointer-events-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">
                {selected.size} {selected.size === 1 ? "ieraksts" : "ieraksti"} atlasīti
              </span>
              <button
                onClick={clearSelection}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Atcelt
              </button>
            </div>

            {bulkMode === "idle" ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="success"
                  className="flex-1"
                  onClick={() => bulkAct("APPROVE")}
                  disabled={isPending}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  Apstiprināt
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setBulkMode("return")}
                  disabled={isPending}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Nosūtīt atpakaļ
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setBulkMode("reject")}
                  disabled={isPending}
                >
                  <XCircle className="h-3.5 w-3.5 mr-1.5" />
                  Noraidīt
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Textarea
                  value={comment}
                  onChange={(ev) => setComment(ev.target.value)}
                  placeholder={
                    bulkMode === "return"
                      ? "Pastāstiet, ko būtu vērts papildināt vai precizēt."
                      : "Pamatojiet, kāpēc ieraksti tiek noraidīti."
                  }
                  className="text-sm resize-none"
                  rows={2}
                />
                {error && <div className="text-xs text-destructive">{error}</div>}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={bulkMode === "return" ? "default" : "destructive"}
                    disabled={isPending || comment.trim().length < 3}
                    onClick={() => bulkAct(bulkMode === "return" ? "RETURN" : "REJECT")}
                    className="flex-1"
                  >
                    {isPending
                      ? "Saglabā..."
                      : bulkMode === "return"
                      ? "Nosūtīt atpakaļ visiem"
                      : "Noraidīt visus"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setBulkMode("idle"); setComment(""); setError(null); }}
                    disabled={isPending}
                  >
                    Atcelt
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
