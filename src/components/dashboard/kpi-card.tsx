import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "warning" | "success" | "destructive";
}

export function KpiCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-5 pt-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">
              {value}
            </div>
            {hint ? (
              <div className="text-xs text-muted-foreground mt-1">{hint}</div>
            ) : null}
          </div>
          {icon ? (
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                tone === "warning" && "bg-warning/10 text-warning",
                tone === "success" && "bg-success/10 text-success",
                tone === "destructive" && "bg-destructive/10 text-destructive",
                tone === "default" && "bg-accent text-accent-foreground"
              )}
            >
              {icon}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
