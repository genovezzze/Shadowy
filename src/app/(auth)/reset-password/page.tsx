import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { isResetTokenValid } from "@/lib/password-reset";
import { ResetForm } from "./reset-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token ?? "";
  const valid = token ? await isResetTokenValid(token) : false;

  return (
    <Card>
      <CardContent className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Jauna parole
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Izvēlieties jaunu paroli savam kontam.
          </p>
        </div>

        {valid ? (
          <ResetForm token={token} />
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-3 text-sm text-destructive">
              Saite ir nederīga vai tās derīguma termiņš ir beidzies. Lūdzu,
              pieprasiet jaunu atjaunošanas saiti.
            </div>
            <Link
              href="/forgot-password"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Pieprasīt jaunu saiti
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
