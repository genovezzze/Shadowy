import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";

const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "artemijlucin@gmail.com";

export default async function TrialExpiredPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <img src="/logo.png" alt="Shadowy" width={56} height={56} />
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Izmēģinājuma periods ir beidzies
          </h1>
          <p className="mt-3 text-muted-foreground">
            Jūsu 30 dienu bezmaksas periods ir beidzies. Sazinieties ar mums,
            lai turpinātu lietot Shadowy.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild size="lg">
            <a href={`mailto:${CONTACT_EMAIL}`}>
              Sazināties — {CONTACT_EMAIL}
            </a>
          </Button>

          {session ? (
            <Button asChild variant="ghost" size="sm">
              <a href="/api/auth/logout">Iziet no konta</a>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Pieslēgties</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
