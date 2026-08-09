"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOutEverywhere } from "@/app/account/actions";

export function SignOutEverywhere() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      await signOutEverywhere();
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm leading-6 text-muted-foreground">
        Pārtrauc pieteikšanos visās ierīcēs un pārlūkos, arī šajā. Izmantojiet to, ja ierīce ir
        pazaudēta vai ir aizdomas, ka parole nonākusi svešās rokās.
      </p>

      {confirming ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? "Izrakstās..." : "Apstiprināt izrakstīšanos"}
          </Button>
          <Button variant="ghost" onClick={() => setConfirming(false)} disabled={pending}>
            Atcelt
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setConfirming(true)}>
          Iziet no visām ierīcēm
        </Button>
      )}
    </div>
  );
}
