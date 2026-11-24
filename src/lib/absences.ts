import { isoDay } from "./team-tasks";

/**
 * Time away from work: vacation, sick leave, or "busy" (a doctor's visit,
 * personal errand). Colleagues see only that the person is away and who
 * substitutes; the note stays private. Pure rules, covered by tests.
 */

export type AbsenceType = "vacation" | "sick" | "busy";

export const ABSENCE_LABEL: Record<AbsenceType, string> = {
  vacation: "Atvaļinājums",
  sick: "Slimības lapa",
  busy: "Aizņemts",
};

/** Away for whole days with work to hand over: a substitute is required. */
export function needsSubstitute(type: AbsenceType): boolean {
  return type === "vacation" || type === "sick";
}

export interface AbsenceLike {
  id?: string;
  userId: string;
  substituteId: string | null;
  type: AbsenceType;
  startDate: Date;
  endDate: Date;
}

export function overlaps(a: { startDate: Date; endDate: Date }, b: { startDate: Date; endDate: Date }): boolean {
  return isoDay(a.startDate) <= isoDay(b.endDate) && isoDay(b.startDate) <= isoDay(a.endDate);
}

export function activeOn(a: { startDate: Date; endDate: Date }, day: Date): boolean {
  const d = isoDay(day);
  return isoDay(a.startDate) <= d && d <= isoDay(a.endDate);
}

export type AbsenceIssue =
  | { kind: "error"; message: string }
  | { kind: "warning"; message: string };

/**
 * Hard errors block saving; warnings are shown but allowed (the manager may
 * know something the system doesn't).
 */
export function checkAbsence(
  absence: AbsenceLike,
  others: AbsenceLike[],
  names: Map<string, string>,
): AbsenceIssue[] {
  const issues: AbsenceIssue[] = [];
  if (isoDay(absence.endDate) < isoDay(absence.startDate)) {
    issues.push({ kind: "error", message: "Beigu datums ir pirms sākuma datuma." });
  }
  if (needsSubstitute(absence.type) && !absence.substituteId) {
    issues.push({ kind: "error", message: "Norādiet aizvietotāju - bez tā prombūtni nevar saglabāt." });
  }
  if (absence.substituteId && absence.substituteId === absence.userId) {
    issues.push({ kind: "error", message: "Aizvietotājs nevar būt tas pats cilvēks." });
  }

  // Skip only the record being edited; a new one has no id yet.
  const relevant = others.filter((o) => !(absence.id && o.id === absence.id) && overlaps(o, absence));

  if (relevant.some((o) => o.userId === absence.userId)) {
    issues.push({ kind: "error", message: "Šajos datumos jums jau ir ierakstīta prombūtne." });
  }

  if (absence.substituteId) {
    const subAway = relevant.find((o) => o.userId === absence.substituteId && o.type !== "busy");
    if (subAway) {
      const who = names.get(absence.substituteId) ?? "Aizvietotājs";
      issues.push({ kind: "error", message: `${who} šajos datumos pats ir prombūtnē. Izvēlieties citu aizvietotāju.` });
    }
    const alreadySubstituting = relevant.filter(
      (o) => o.substituteId === absence.substituteId && o.userId !== absence.userId,
    );
    if (alreadySubstituting.length > 0) {
      const who = names.get(absence.substituteId) ?? "Aizvietotājs";
      const forWhom = alreadySubstituting.map((o) => names.get(o.userId) ?? "kolēģi").join(", ");
      issues.push({ kind: "warning", message: `${who} šajā laikā jau aizvieto: ${forWhom}.` });
    }
  }

  // Someone away may be covering for this person: who covers for them then?
  const coveringMe = relevant.filter((o) => o.substituteId === absence.userId && needsSubstitute(absence.type));
  if (coveringMe.length > 0) {
    const forWhom = coveringMe.map((o) => names.get(o.userId) ?? "kolēģi").join(", ");
    issues.push({ kind: "warning", message: `Šajā laikā jūs esat aizvietotājs: ${forWhom}. Brīdiniet vadītāju.` });
  }

  return issues;
}
