import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { WorkTypeBadge } from "./work-type-badge";
import { formatDateLV, formatDurationLV } from "@/lib/utils";
import type { WorkType } from "@/lib/work-type";

type EntryStatus = "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";

interface EntryCardProps {
  title: string;
  category: string;
  description: string;
  workDate: Date | string;
  durationMinutes: number;
  status: EntryStatus;
  employeeName?: string;
  managerComment?: string | null;
  workType?: WorkType;
  footer?: React.ReactNode;
}

export function EntryCard({
  title,
  category,
  description,
  workDate,
  durationMinutes,
  status,
  employeeName,
  managerComment,
  workType,
  footer,
}: EntryCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{category}</span>
              <span>·</span>
              <span>{formatDateLV(workDate)}</span>
              <span>·</span>
              <span>{formatDurationLV(durationMinutes)}</span>
            </div>
            <h3 className="mt-1 text-base font-semibold leading-snug">
              {title}
            </h3>
            {employeeName ? (
              <div className="text-xs text-muted-foreground mt-1">
                Iesniedzējs: {employeeName}
              </div>
            ) : null}
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <StatusBadge status={status} />
            {workType && <WorkTypeBadge workType={workType} />}
          </div>
        </div>
        <p className="mt-3 text-sm text-foreground/90 whitespace-pre-wrap">
          {description}
        </p>
        {managerComment ? (
          <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Vadītāja komentārs
            </div>
            <div className="whitespace-pre-wrap">{managerComment}</div>
          </div>
        ) : null}
        {footer ? <div className="mt-4">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}
