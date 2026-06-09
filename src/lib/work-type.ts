export type WorkType = "in_role" | "extra" | "no_role";

export function classifyWorkType(
  entryCategory: string,
  entryTitle: string,
  duties: string[]
): WorkType {
  if (duties.length === 0) return "no_role";

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-zāčēģīķļņšūž\s]/gi, " ");
  const cat = normalize(entryCategory);
  const title = normalize(entryTitle);
  const combined = `${cat} ${title}`;

  for (const duty of duties) {
    const d = normalize(duty);
    // Direct substring match
    if (d.includes(cat) || cat.includes(d)) return "in_role";
    // Word-level match (words longer than 4 chars to avoid noise)
    const dutyWords = d.split(/\s+/).filter(w => w.length > 4);
    if (dutyWords.some(word => combined.includes(word))) return "in_role";
  }

  return "extra";
}

export const workTypeLabel: Record<WorkType, string> = {
  in_role: "Ietilpst lomā",
  extra: "Papildu ieguldījums",
  no_role: "Loma nav piešķirta",
};

export const workTypeTone: Record<WorkType, "success" | "default" | "muted"> = {
  in_role: "success",
  extra: "default",
  no_role: "muted",
};
