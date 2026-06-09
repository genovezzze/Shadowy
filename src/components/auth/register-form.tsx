"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerAction } from "@/app/(auth)/register/actions";

export function RegisterForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setError(null);
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
        <div className="grid gap-1.5">
          <Label htmlFor="organizationName" className="text-xs">Organizācijas nosaukums</Label>
          <Input id="organizationName" name="organizationName" required maxLength={80} placeholder="Piem., SIA Mans Uzņēmums" className="h-9 text-sm" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="name" className="text-xs">Vārds un uzvārds</Label>
          <Input id="name" name="name" required maxLength={80} autoComplete="name" placeholder="Vārds Uzvārds" className="h-9 text-sm" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="email" className="text-xs">E-pasts</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="vards@uznemums.lv" className="h-9 text-sm" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="password" className="text-xs">Parole</Label>
          <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="Vismaz 8 simboli" className="h-9 text-sm" />
        </div>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Veido kontu..." : "Izveidot organizāciju"}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground text-center">
        Veidojot kontu, jūs piekrītat, ka Shadowy ir komandām, nevis personīgai novērošanai.
      </p>
    </div>
  );
}
