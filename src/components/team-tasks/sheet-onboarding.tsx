"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutGrid, PencilRuler } from "lucide-react";
import { cn } from "@/lib/utils";
import { METRIC_SURFACE } from "@/components/dashboard/apple";
import { applyReportTemplate } from "./registry-actions";

/**
 * First visit with nothing set up: start from the ready-made sheet (VID
 * deadlines) or build your own columns.
 */
export function SheetOnboarding({ clientCount }: { clientCount: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function startFromTemplate(templateId: "basic" | "extended") {
    setError(null);
    startTransition(async () => {
      const result = await applyReportTemplate("mine", templateId);
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  }

  const card = cn(
    METRIC_SURFACE,
    "flex flex-col gap-3 p-5 text-left transition-colors hover:border-black/[0.16] dark:hover:border-white/[0.16]",
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-medium">Sāksim ar jūsu tabulu</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {clientCount > 0
            ? `Jums ir piesaistīti ${clientCount} klienti. Izvēlieties, kā veidot mēneša atskaišu tabulu.`
            : "Jums vēl nav piesaistītu klientu. Tabulu var sagatavot jau tagad - klienti parādīsies, kad vadītājs tos piesaistīs."}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <button type="button" onClick={() => startFromTemplate("basic")} disabled={pending} className={card}>
          <LayoutGrid className="h-5 w-5 text-[#007AFF]" />
          <span className="text-[15px] font-medium">{pending ? "Veido..." : "Pamata veidne"}</span>
          <span className="text-[13px] text-muted-foreground">
            11 kolonnas: PB rēķ., KASE, Banka, Alga, PVN, UIN, VSAOI, Fiz.pers. paz. un citas. Termiņš tikai četrām:
            Fiz.pers. paz. līdz 15., VSAOI līdz 17., PVN un UIN līdz 20.
          </span>
        </button>
        <button type="button" onClick={() => startFromTemplate("extended")} disabled={pending} className={card}>
          <LayoutGrid className="h-5 w-5 text-[#007AFF]" />
          <span className="text-[15px] font-medium">{pending ? "Veido..." : "Paplašinātā veidne"}</span>
          <span className="text-[13px] text-muted-foreground">
            18 kolonnas: arī nosūtītā alga, IIeN nerezidentiem, DRN (reizi ceturksnī), statistika, op. bilance, debitori,
            kreditori, lauksaimnieki.
          </span>
        </button>
        <Link href="/employee/uzdevumi/tabula" className={card}>
          <PencilRuler className="h-5 w-5 text-[#007AFF]" />
          <span className="text-[15px] font-medium">Izveidot savu</span>
          <span className="text-[13px] text-muted-foreground">
            Pievienojiet savas kolonnas un katrai savu termiņa dienu - kā jūsu Excel tabulā.
          </span>
        </Link>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
