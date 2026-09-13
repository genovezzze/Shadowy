import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { WorkTypeBadge } from "./work-type-badge";
import { formatDateLV, formatDurationLV } from "@/lib/utils";
import type { WorkType } from "@/lib/work-type";
import { categoryLabel } from "@/lib/work-insights";

type EntryStatus = "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";

interface EntryCardProps {
  title: string;
  category: string;
  description: string;
  clientName?: string | null;
  clientHref?: string;
  workDate: Date | string;
  /** When the employee logged the entry. Often later than workDate - people
   * enter last week's work days after the fact - so it is shown separately. */
  createdAt?: Date | string;
  durationMinutes: number;
  status: EntryStatus;
  employeeName?: string;
  managerComment?: string | null;
  workType?: WorkType;
  /** Set when the entry was done to cover for someone. */
  helpedColleague?: boolean | null;
  /** Who it was done for. Optional even when helpedColleague is set - naming
   * the colleague is not required when ticking the box. */
  helpedName?: string | null;
  footer?: React.ReactNode;
}

export function EntryCard({
  title,
  category,
  description,
  clientName,
  clientHref,
  workDate,
  createdAt,
  durationMinutes,
  status,
  employeeName,
  managerComment,
  workType,
  helpedColleague,
  helpedName,
  footer,
}: EntryCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{categoryLabel(category)}</span>
              <span>·</span>
              {clientName ? (
                clientHref ? (
                  <Link href={clientHref} className="hover:underline hover:text-foreground transition-colors">
                    {clientName}
                  </Link>
                ) : (
                  <span>{clientName}</span>
                )
              ) : (
                <span className="italic">Bez klienta</span>
              )}
              <span>·</span>
              <span>{formatDurationLV(durationMinutes)}</span>
              {helpedColleague ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
                  <HeartHandshake className="h-3 w-3 shrink-0" />
                  {helpedName
                    ? `Palīdzēja: ${helpedName}`
                    : "Palīdzība kolēģim"}
                </span>
              ) : null}
            </div>
            <h3 className="mt-1 text-base font-semibold leading-snug">
              {title}
            </h3>
            {employeeName ? (
              <div className="text-xs text-muted-foreground mt-1">
                Iesniedzējs: {employeeName}
              </div>
            ) : null}
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
              <span>Darbs veikts: <span className="text-foreground/80">{formatDateLV(workDate)}</span></span>
              {createdAt ? (
                <>
                  <span>·</span>
                  <span>Ievadīts: <span className="text-foreground/80">{formatDateLV(createdAt)}</span></span>
                </>
              ) : null}
            </div>
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
