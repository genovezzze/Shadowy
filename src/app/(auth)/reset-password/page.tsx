import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
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
    <AuthCard
      title="Jauna parole"
      description="Izvēlieties jaunu paroli savam kontam."
    >
      {valid ? (
        <ResetForm token={token} />
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-3 text-sm text-destructive">
            Saite ir nederīga vai tās derīguma termiņš ir beidzies. Lūdzu,
            pieprasiet jaunu atjaunošanas saiti.
          </div>
          <Link
            href="/forgot-password"
            className="btn-shimmer inline-flex h-10 w-full items-center justify-center rounded-[10px] px-4 text-sm font-semibold text-white"
          >
            Pieprasīt jaunu saiti
          </Link>
        </div>
      )}
    </AuthCard>
  );
}
