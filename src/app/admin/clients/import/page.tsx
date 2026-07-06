import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { ImportClient } from "./import-client";

export default async function ImportClientsPage() {
  await requireUser(["ADMIN", "MANAGER"]);

  return (
    <>
      <PageHeader
        title="Importēt no Excel"
        description="Augšupielādē Excel failu ar klientu un darbinieku sarakstiem. Sistēma automātiski sasaistīs darbiniekus ar klientiem."
      />
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground mb-6 max-w-2xl">
        Sistēma automātiski atpazīst kolonnas ar nosaukumiem <strong className="text-foreground">Uzņēmums</strong> un <strong className="text-foreground">Grāmatvedis</strong> (vai Darbinieks). Viens rindā = viens klients + viens darbinieks.
      </div>
      <ImportClient />
    </>
  );
}
