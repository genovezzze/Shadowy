import { Suspense } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthCard
      title="Pierakstīties"
      description="Ievadiet savu e-pastu un paroli, lai turpinātu."
    >
      <Suspense fallback={<div className="text-sm text-white/40">Ielādē...</div>}>
        <LoginForm />
      </Suspense>

      <div className="mt-6 text-sm text-white/45">
        Vēl nav konta?{" "}
        <Link
          href="/register"
          className="font-semibold text-white underline-offset-4 hover:underline"
        >
          Izveidot jaunu organizāciju
        </Link>
      </div>
    </AuthCard>
  );
}
