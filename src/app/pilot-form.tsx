"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitPilotApplication } from "./pilot-actions";
import { CheckCircle2 } from "lucide-react";

const TEAM_SIZES = [
  "2–5 cilvēki",
  "6–15 cilvēki",
  "16–50 cilvēki",
  "51+ cilvēki",
];

export function PilotForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await submitPilotApplication(formData);
      if (!res.ok) setError(res.error);
      else setDone(true);
    });
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="h-8 w-8 text-[hsl(160_84%_39%)]" />
        <p className="font-semibold">Pieteikums nosūtīts!</p>
        <p className="text-sm text-muted-foreground">
          Sazināsimies ar jums tuvāko dienu laikā.
        </p>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="pilot-name">Vārds un uzvārds</Label>
          <Input id="pilot-name" name="name" placeholder="Jānis Bērziņš" required maxLength={100} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="pilot-company">Uzņēmums</Label>
          <Input id="pilot-company" name="company" placeholder="SIA Piemērs" required maxLength={100} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="pilot-email">E-pasts</Label>
          <Input id="pilot-email" name="email" type="email" placeholder="janis@uznemums.lv" required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="pilot-size">Komandas lielums</Label>
          <select
            id="pilot-size"
            name="teamSize"
            required
            className="flex h-9 w-full rounded-md border border-input bg-[#060d1c] text-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [&>option]:bg-[#0d1b2e] [&>option]:text-white"
          >
            <option value="">Izvēlieties...</option>
            {TEAM_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="pilot-comment">Īss komentārs <span className="text-muted-foreground">(nav obligāts)</span></Label>
        <textarea
          id="pilot-comment"
          name="comment"
          rows={3}
          maxLength={1000}
          placeholder="Ko jūs vēlaties uzlabot komandā? Kādi ir galvenie izaicinājumi?"
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="btn-hero-glow inline-flex items-center justify-center rounded-full px-8 py-[17px] font-display font-black text-[15px] tracking-tight text-white transition-transform duration-150 hover:-translate-y-[1px] active:translate-y-[0.5px] disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto"
      >
        {pending ? "Sūta..." : "Pieteikt 30 dienu pilotu"}
      </button>
    </form>
  );
}
