"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClientReportActions() {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()}>
      <Printer className="size-4" />
      Drukāt vai saglabāt PDF
    </Button>
  );
}
