"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportPrintButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()} className="print:hidden">
      <Printer className="h-4 w-4 mr-2" />
      Drukāt / Saglabāt PDF
    </Button>
  );
}
