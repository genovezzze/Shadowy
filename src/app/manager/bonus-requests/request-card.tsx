"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { approveRequest, rejectRequest, returnRequest } from "./actions";
import { REWARD_LABELS, PERIOD_LABELS, BONUS_STATUS_LABELS, BONUS_STATUS_TONE } from "@/lib/reward-types";
import type { RewardType, PeriodType, BonusRequestStatus } from "@/lib/reward-types";
import { formatDateLV } from "@/lib/utils";

interface RequestCardProps {
  request: {
    id: string;
    rewardType: string;
    status: string;
    hoursAccumulated: number;
    employeeComment: string | null;
    managerComment: string | null;
    requestedAt: Date | string;
    employee: { name: string };
    rule: {
      name: string;
      minimumHours: number;
      periodType: string;
      categories: string[];
    };
  };
  reviewed?: boolean;
}

export function RequestCard({ request, reviewed = false }: RequestCardProps) {
  const [returnOpen, setReturnOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(() => approveRequest(request.id));
  }

  function handleReject() {
    startTransition(() => rejectRequest(request.id));
  }

  function handleReturn() {
    if (!comment.trim()) {
      setCommentError("Lūdzu, ievadiet komentāru.");
      return;
    }
    setCommentError("");
    startTransition(async () => {
      await returnRequest(request.id, comment);
      setReturnOpen(false);
    });
  }

  const status = request.status as BonusRequestStatus;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{request.employee.name}</span>
              <Badge variant={BONUS_STATUS_TONE[status]}>
                {BONUS_STATUS_LABELS[status]}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatDateLV(request.requestedAt)}
            </div>
          </div>
          <Badge variant="success" className="shrink-0">
            {REWARD_LABELS[request.rewardType as RewardType]}
          </Badge>
        </div>

        <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3 text-sm grid gap-1">
          <div className="font-medium text-xs text-muted-foreground mb-1">Noteikums</div>
          <div className="font-medium">{request.rule.name}</div>
          <div className="text-xs text-muted-foreground">
            {request.rule.minimumHours}h / {PERIOD_LABELS[request.rule.periodType as PeriodType]}
            {request.rule.categories.length > 0 && (
              <> · {request.rule.categories.join(", ")}</>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Uzkrātās stundas:</span>
          <span className="font-semibold">
            {request.hoursAccumulated}h
          </span>
          <span className="text-xs text-muted-foreground">
            (min. {request.rule.minimumHours}h)
          </span>
        </div>

        {request.employeeComment && (
          <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Darbinieka komentārs
            </div>
            <div className="whitespace-pre-wrap">{request.employeeComment}</div>
          </div>
        )}

        {request.managerComment && (
          <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Jūsu komentārs
            </div>
            <div className="whitespace-pre-wrap">{request.managerComment}</div>
          </div>
        )}

        {!reviewed && (
          <div className="mt-4 space-y-3">
            {!returnOpen ? (
              <div className="flex gap-2">
                <Button size="sm" onClick={handleApprove} disabled={pending}>
                  {pending ? "..." : "Apstiprināt"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReturnOpen(true)}
                  disabled={pending}
                >
                  Nosūtīt atpakaļ
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReject}
                  disabled={pending}
                  className="text-destructive hover:text-destructive"
                >
                  Noraidīt
                </Button>
              </div>
            ) : (
              <div className="grid gap-2">
                <Textarea
                  placeholder="Komentārs darbiniekim (obligāts)..."
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1000}
                />
                {commentError && (
                  <p className="text-xs text-destructive">{commentError}</p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleReturn} disabled={pending}>
                    {pending ? "..." : "Nosūtīt atpakaļ"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setReturnOpen(false); setComment(""); setCommentError(""); }}
                    disabled={pending}
                  >
                    Atcelt
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
