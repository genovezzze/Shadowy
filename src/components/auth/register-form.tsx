"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { TermsDialog } from "@/components/auth/terms-dialog";
import { registerAction } from "@/app/(auth)/register/actions";
import {
  authFieldClassName,
  authLabelClassName,
  authPrimaryButtonClassName,
} from "@/components/auth/styles";

export function RegisterForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);

    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");
    if (password !== confirmPassword) {
      setError("Paroles nesakrīt.");
      return;
    }
    if (!termsAccepted) {
      setError("Lūdzu, izlasiet un pieņemiet lietošanas noteikumus.");
      return;
    }

    startTransition(async () => {
      const res = await registerAction(formData);
      if (!res.ok) {
        setError(res.error);
      } else if (res.redirectTo) {
        router.push(res.redirectTo);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      <form action={onSubmit} className="space-y-3">
        <div className="grid gap-2">
          <Label htmlFor="organizationName" className={authLabelClassName}>
            Organizācijas nosaukums
          </Label>
          <Input
            id="organizationName"
            name="organizationName"
            required
            maxLength={80}
            placeholder="Piem., SIA Mans Uzņēmums"
            className={authFieldClassName}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="name" className={authLabelClassName}>
            Vārds un uzvārds
          </Label>
          <Input
            id="name"
            name="name"
            required
            maxLength={80}
            autoComplete="name"
            placeholder="Vārds Uzvārds"
            className={authFieldClassName}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email" className={authLabelClassName}>
            E-pasts
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="vards@uznemums.lv"
            className={authFieldClassName}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password" className={authLabelClassName}>
            Parole
          </Label>
          <PasswordInput
            id="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Vismaz 8 simboli"
            className={authFieldClassName}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword" className={authLabelClassName}>
            Apstipriniet paroli
          </Label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Ievadiet paroli vēlreiz"
            className={authFieldClassName}
          />
        </div>

        <TermsDialog
          accepted={termsAccepted}
          onAccept={() => {
            setTermsAccepted(true);
            setError(null);
          }}
        />

        {error && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 font-accent text-sm leading-5 text-red-300">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className={authPrimaryButtonClassName}
          disabled={pending || !termsAccepted}
        >
          {pending ? "Veido kontu..." : "Izveidot organizāciju"}
        </Button>
      </form>

      <p className="text-center font-accent text-xs font-light leading-5 text-white/35">
        Shadowy ir paredzēts komandām, nevis personīgai novērošanai
      </p>
    </div>
  );
}
