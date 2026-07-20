"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { resetPassword } from "./actions";

export function ResetForm({ token }: { token: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await resetPassword(token, formData);
      if (!res.ok) setError(res.error);
      // No router.refresh() here: the token is single-use and was just
      // consumed, so re-running the server component would re-check it,
      // find it spent, and replace this success state with the
      // "link expired" error — even though the password did change.
      else setDone(true);
    });
  }

  if (done) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-success/30 bg-success/5 px-3 py-3 text-sm text-foreground">
          Parole ir veiksmīgi nomainīta. Tagad varat pieslēgties ar jauno paroli.
        </div>
        <Link
          href="/login"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Pieslēgties
        </Link>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="newPassword">Jaunā parole</Label>
        <PasswordInput
          id="newPassword"
          name="newPassword"
          autoComplete="new-password"
          minLength={8}
          required
          placeholder="Vismaz 8 simboli"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">Atkārtojiet jauno paroli</Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saglabā..." : "Iestatīt jauno paroli"}
      </Button>
    </form>
  );
}
