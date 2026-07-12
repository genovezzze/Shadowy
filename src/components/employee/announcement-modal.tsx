"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateLV } from "@/lib/utils";
import { dismissAnnouncement } from "@/app/employee/announcements-actions";

export function AnnouncementModal({
  announcement,
}: {
  announcement: { id: string; title: string; body: string; createdAt: Date } | null;
}) {
  const [open, setOpen] = useState(true);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (!announcement) return null;

  function handleDismiss() {
    setOpen(false);
    startTransition(async () => {
      await dismissAnnouncement(announcement!.id);
      router.refresh();
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!next) handleDismiss(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[80vh] min-h-[45vh] w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl focus:outline-none"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
                <Megaphone className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <Dialog.Title className="break-words text-lg font-semibold leading-tight">
                  {announcement.title}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                  {formatDateLV(announcement.createdAt)}
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close
              aria-label="Aizvērt"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground/90">
              {announcement.body}
            </p>
          </div>

          <div className="border-t border-border px-6 py-4">
            <Button type="button" onClick={handleDismiss} disabled={pending} className="w-full sm:w-auto">
              Sapratu
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
