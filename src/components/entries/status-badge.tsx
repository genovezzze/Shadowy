import type { EntryStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { statusLabel, statusTone } from "@/lib/i18n";

export function StatusBadge({ status }: { status: EntryStatus }) {
  return <Badge variant={statusTone[status]}>{statusLabel[status]}</Badge>;
}
