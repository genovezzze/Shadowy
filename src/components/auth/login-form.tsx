"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { loginAction } from "@/app/(auth)/login/actions";
import {
  authFieldClassName,
  authLabelClassName,
  authPrimaryButtonClassName,
} from "@/components/auth/styles";

const OAUTH_ERRORS: Record<string, string> = {
  no_account:
    "Šim Google kontam nav piesaistīta Shadowy lietotne. Sazinieties ar savu vadītāju vai administratoru.",
  google_email: "Neizdevās iegūt apstiprinātu e-pastu no Google.",
  google_state: "Pieslēgšanās sesija beidzās. Lūdzu, mēģiniet vēlreiz.",
  google_config: "Google pieslēgšanās nav konfigurēta.",
  google_token: "Neizdevās pabeigt pieslēgšanos ar Google.",
  google_userinfo: "Neizdevās pabeigt pieslēgšanos ar Google.",
};

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params.get("next") ?? undefined;
  const errorCode = params.get("error");
  const [remember, setRemember] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(
    errorCode ? OAUTH_ERRORS[errorCode] ?? "Neizdevās pieslēgties." : null
  );

  async function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await loginAction(formData);
      if (!res.ok) {
        setError(res.error);
      } else if (res.redirectTo) {
        router.push(nextPath ?? res.redirectTo);
        router.refresh();
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <div className="grid gap-2">
        <Label htmlFor="email" className={authLabelClassName}>
          E-pasts
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="E-pasts"
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
          autoComplete="current-password"
          required
          minLength={6}
          placeholder="Parole"
          className={authFieldClassName}
        />
      </div>
      <label className="group flex cursor-pointer select-none items-center gap-2.5 py-0.5">
        <input
          type="checkbox"
          name="rememberMe"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="sr-only"
        />
        <span className={`flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${remember ? "border-white/30 bg-white/[0.12]" : "border-white/[0.18] bg-white/[0.05] group-hover:border-white/25"}`}>
          {remember && (
            <svg viewBox="0 0 10 8" className="size-2.5 text-white/70" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1,4 3.5,6.5 9,1" />
            </svg>
          )}
        </span>
        <span className="font-accent text-sm text-white/50 transition-colors group-hover:text-white/65">
          Atcerēties mani
        </span>
      </label>
      {error ? (
        <div className="rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 font-accent text-sm leading-5 text-red-300">
          {error}
        </div>
      ) : null}
      <Button
        type="submit"
        className={authPrimaryButtonClassName}
        disabled={pending}
      >
        {pending ? "Pārbauda..." : "Pieslēgties"}
      </Button>

      <div className="-mt-1 text-right">
        <Link
          href="/forgot-password"
          className="font-accent text-sm text-white/45 transition hover:text-emerald-200"
        >
          Aizmirsi paroli?
        </Link>
      </div>

      <div className="flex items-center gap-3 py-1.5">
        <span className="h-px flex-1 bg-white/[0.09]" />
        <span className="font-accent text-xs text-white/30">vai</span>
        <span className="h-px flex-1 bg-white/[0.09]" />
      </div>

      <Button
        asChild
        variant="outline"
        className="h-11 w-full rounded-lg border-white/[0.17] bg-black font-accent text-sm font-bold text-white/82 shadow-none hover:border-white/30 hover:bg-white/[0.035] hover:text-white"
      >
        <a href="/api/auth/google">
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Turpināt ar Google
        </a>
      </Button>
    </form>
  );
}
