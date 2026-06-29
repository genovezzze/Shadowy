"use client";

import { useState, useTransition } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitPilotApplication } from "./pilot-actions";

const TEAM_SIZES = [
  "2–5 cilvēki",
  "6–15 cilvēki",
  "16–50 cilvēki",
  "51+ cilvēki",
] as const;

const fieldClassName =
  "h-10 rounded-lg border-white/[0.12] bg-[#0c1014] px-3.5 font-accent text-[13px] tracking-[0.025em] text-white shadow-none placeholder:text-white/32 focus-visible:border-emerald-300/35 focus-visible:ring-1 focus-visible:ring-emerald-300/25";

export function PilotForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitPilotApplication(formData);
      if (!result.ok) setError(result.error);
      else setDone(true);
    });
  }

  if (done) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.04] px-6 text-center">
        <span className="grid size-12 place-items-center rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-300">
          <CheckCircle2 className="size-6" />
        </span>
        <p className="font-accent text-xl font-bold text-white">
          Pieteikums nosūtīts!
        </p>
        <p className="font-accent text-sm font-light text-white/50">
          Sazināsimies ar jums tuvāko dienu laikā
        </p>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-3.5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label
            htmlFor="pilot-name"
            className="font-accent text-[13px] font-bold tracking-[0.025em] text-white/80"
          >
            Vārds un uzvārds <span className="text-red-400">*</span>
          </Label>
          <Input
            id="pilot-name"
            name="name"
            placeholder="Jānis Bērziņš"
            required
            maxLength={100}
            className={fieldClassName}
          />
        </div>

        <div className="grid gap-1.5">
          <Label
            htmlFor="pilot-company"
            className="font-accent text-[13px] font-bold tracking-[0.025em] text-white/80"
          >
            Uzņēmums <span className="text-red-400">*</span>
          </Label>
          <Input
            id="pilot-company"
            name="company"
            placeholder="SIA Piemērs"
            required
            maxLength={100}
            className={fieldClassName}
          />
        </div>

        <div className="grid gap-1.5 sm:col-span-2">
          <Label
            htmlFor="pilot-email"
            className="font-accent text-[13px] font-bold tracking-[0.025em] text-white/80"
          >
            E-pasts <span className="text-red-400">*</span>
          </Label>
          <Input
            id="pilot-email"
            name="email"
            type="email"
            placeholder="janis@uznemums.lv"
            required
            className={fieldClassName}
          />
        </div>

        <div className="grid gap-1.5 sm:col-span-2">
          <Label
            htmlFor="pilot-size"
            className="font-accent text-[13px] font-bold tracking-[0.025em] text-white/80"
          >
            Komandas lielums <span className="text-red-400">*</span>
          </Label>
          <Select name="teamSize" required>
            <SelectTrigger id="pilot-size" className={fieldClassName}>
              <SelectValue placeholder="Izvēlieties..." />
            </SelectTrigger>
            <SelectContent>
              {TEAM_SIZES.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label
          htmlFor="pilot-comment"
          className="font-accent text-[13px] font-bold tracking-[0.025em] text-white/80"
        >
          Īss komentārs{" "}
          <span className="font-light text-white/30">(nav obligāts)</span>
        </Label>
        <textarea
          id="pilot-comment"
          name="comment"
          rows={2}
          maxLength={1000}
          placeholder="Ko jūs vēlaties uzlabot komandā? Kādi ir galvenie izaicinājumi?"
          className="w-full resize-none rounded-lg border border-white/[0.12] bg-[#0c1014] px-3.5 py-2.5 font-accent text-[13px] font-light tracking-[0.025em] text-white outline-none transition placeholder:text-white/32 focus:border-emerald-300/35 focus:ring-1 focus:ring-emerald-300/25"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="flex justify-end border-t border-white/[0.09] pt-3.5">
        <button
          type="submit"
          disabled={pending}
          className="group inline-flex items-center justify-center gap-2 rounded-lg border border-white/75 bg-white px-5 py-2.5 font-accent text-[13px] font-bold tracking-[0.035em] text-[#06110e] shadow-[0_0_22px_rgba(255,255,255,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(255,255,255,0.18)] disabled:pointer-events-none disabled:opacity-50"
        >
          {pending ? "Sūta..." : "Pieteikt pilotu"}
          {!pending && (
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          )}
        </button>
      </div>
    </form>
  );
}
