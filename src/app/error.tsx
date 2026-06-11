"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <img src="/shadowy.svg" alt="Shadowy" width={56} height={56} />
        </div>

        <div>
          <p className="text-5xl font-bold text-muted-foreground/30">500</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Kaut kas nogāja greizi
          </h1>
          <p className="mt-3 text-muted-foreground">
            Radās neparedzēta kļūda. Lūdzu, mēģiniet vēlreiz.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={reset}>Mēģināt vēlreiz</Button>
          <Button asChild variant="ghost">
            <a href="/">Doties uz sākumu</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
