"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatDateTimeLV } from "@/lib/utils";
import { deleteAnnouncement } from "./actions";

interface AnnouncementRowProps {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  readCount: number;
  totalEmployees: number;
}

export function AnnouncementRow({
  id,
  title,
  body,
  createdAt,
  readCount,
  totalEmployees,
}: AnnouncementRowProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Dzēst paziņojumu "${title}"?`)) return;
    startTransition(async () => {
      await deleteAnnouncement(id);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">{formatDateTimeLV(createdAt)}</div>
            <h3 className="mt-1 break-words text-base font-semibold leading-snug">{title}</h3>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-foreground/90">{body}</p>
            <div className="mt-3 text-xs text-muted-foreground">
              Redzējuši {readCount} / {totalEmployees} darbinieki
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={pending}
            className="shrink-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
