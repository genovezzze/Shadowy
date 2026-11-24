import { redirect } from "next/navigation";

/** Moved under Klienti; old links and bookmarks land on the new page. */
export default function OldRegistryPage() {
  redirect("/manager/clients/atskaites");
}
