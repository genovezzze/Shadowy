"use client";

import { useRef, useState, useTransition } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { changeOwnPassword } from "@/app/account/actions";

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function onSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const res = await changeOwnPassword(formData);
      if (!res.ok) setError(res.error);
      else {
        setSuccess(true);
        formRef.current?.reset();
      }
    });
  }

  return (
    <form ref={formRef} action={onSubmit} className="space-y-3 max-w-sm">
      <div className="grid gap-1.5">
        <Label htmlFor="currentPassword">Pašreizējā parole</Label>
        <PasswordInput
          id="currentPassword"
          name="currentPassword"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="grid gap-1.5">
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
      <div className="grid gap-1.5">
        <Label htmlFor="confirmPassword">Atkārtojiet jauno paroli</Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      {error ? <div className="text-sm text-destructive">{error}</div> : null}
      {success ? (
        <div className="text-sm text-success">Parole ir nomainīta.</div>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saglabā..." : "Atjaunināt paroli"}
      </Button>
    </form>
  );
}
