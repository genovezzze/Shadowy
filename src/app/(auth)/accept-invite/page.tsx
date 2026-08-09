"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { acceptInviteAction } from "./actions";
import { startNavigationLoading } from "@/lib/navigation-loading";

function AcceptInviteForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(
    !token ? "Uzaicinājuma saite nav derīga." : null
  );

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await acceptInviteAction(formData);
      if (!res.ok) setError(res.error);
      else {
        startNavigationLoading(res.redirectTo);
        router.push(res.redirectTo);
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div className="grid gap-2">
        <Label htmlFor="password">Jaunā parole</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Vismaz 8 simboli"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">Apstiprināt paroli</Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Ievadiet paroli vēlreiz"
        />
      </div>
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <Button
        type="submit"
        variant="glass"
        className="w-full rounded-[10px] bg-white/[0.12] hover:bg-white/[0.18]"
        disabled={pending || !token}
      >
        {pending ? "Saglabā..." : "Iestatīt paroli un pieslēgties"}
      </Button>
    </form>
  );
}

export default function AcceptInvitePage() {
  return (
    <AuthCard
      title="Iestatīt paroli"
      description="Izveidojiet savu paroli, lai piekļūtu Shadowy."
    >
      <Suspense fallback={<div className="text-sm text-white/40">Ielādē...</div>}>
        <AcceptInviteForm />
      </Suspense>
    </AuthCard>
  );
}
