import { AlertTriangle } from "lucide-react";

/**
 * Shown in place of the client picker when an employee has no clients
 * assigned. Without it the form silently degrades to a plain text input, which
 * reads as normal behaviour - two pilot employees typed client names by hand
 * for two months before anyone realised their assignments were missing.
 */
export function NoClientsNotice() {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <div className="space-y-1 text-xs leading-relaxed">
        <p className="font-medium text-amber-500">Nav piesaistīts neviens klients</p>
        <p className="text-muted-foreground">
          Klienta nosaukums pagaidām jāraksta ar roku. Paziņojiet administratoram,
          lai piesaista klientus - tad šeit būs saraksts un ieraksti automātiski
          saistīsies ar pareizo klientu.
        </p>
      </div>
    </div>
  );
}
