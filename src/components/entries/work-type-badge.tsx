import { Badge } from "@/components/ui/badge";
import { workTypeLabel, workTypeTone, type WorkType } from "@/lib/work-type";

export function WorkTypeBadge({ workType }: { workType: WorkType }) {
  return (
    <Badge variant={workTypeTone[workType]}>
      {workTypeLabel[workType]}
    </Badge>
  );
}
