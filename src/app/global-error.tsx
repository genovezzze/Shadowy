"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { recoverFromChunkLoadError } from "@/lib/chunk-error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
    recoverFromChunkLoadError(error);
  }, [error]);

  return (
    <html>
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#09090b", color: "#fafafa" }}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
            <p style={{ fontSize: 72, fontWeight: 700, color: "rgba(250,250,250,0.15)", margin: 0 }}>500</p>
            <h1 style={{ fontSize: 24, fontWeight: 600, marginTop: 8 }}>Kaut kas nogāja greizi</h1>
            <p style={{ color: "rgba(250,250,250,0.5)", marginTop: 12 }}>
              Radās neparedzēta kļūda. Lūdzu, mēģiniet vēlreiz.
            </p>
            <button
              onClick={reset}
              style={{ marginTop: 24, padding: "10px 24px", background: "#fafafa", color: "#09090b", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 500 }}
            >
              Mēģināt vēlreiz
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
