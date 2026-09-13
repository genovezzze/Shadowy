"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestDataDeletion } from "./actions";

export function DataRequestForm() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] px-4 py-3.5">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
        <div className="text-sm">
          <div className="font-medium">Pieprasījums nosūtīts</div>
          <p className="mt-0.5 text-muted-foreground">
            Administrators saņēma tavu lūgumu un sazināsies ar tevi. Dati netiek dzēsti automātiski.
          </p>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <ShieldAlert className="h-4 w-4" />
        Pieprasīt datu dzēšanu
      </Button>
    );
  }

  return (
    <form
      action={(fd) => startTransition(async () => {
        await requestDataDeletion(fd);
        setDone(true);
      })}
      className="space-y-3 rounded-lg border border-border bg-muted/20 p-4"
    >
      <div>
        <label htmlFor="reason" className="text-sm font-medium">
          Pamatojums (neobligāti)
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={3}
          maxLength={1000}
          placeholder="Piemēram: aizeju no uzņēmuma un vēlos, lai mani dati tiek anonimizēti."
          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Nosūta..." : "Nosūtīt pieprasījumu"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
          Atcelt
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Pieprasījums nonāk pie administratora. Dati netiek dzēsti automātiski.
      </p>
    </form>
  );
}
