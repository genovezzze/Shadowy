"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "./actions";

export function ForgotForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await requestPasswordReset(formData);
      if (!res.ok) setError(res.error);
      else setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-success/30 bg-success/5 px-3 py-3 text-sm text-foreground">
          Ja konts ar šādu e-pastu eksistē, mēs nosūtījām paroles atjaunošanas
          saiti. Pārbaudiet savu e-pastu.
        </div>
        <Link
          href="/login"
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Atpakaļ uz pieslēgšanos
        </Link>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="email">E-pasts</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="vards@uznemums.lv"
        />
      </div>
      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sūta..." : "Nosūtīt atjaunošanas saiti"}
      </Button>
      <Link
        href="/login"
        className="block text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        Atpakaļ uz pieslēgšanos
      </Link>
    </form>
  );
}
