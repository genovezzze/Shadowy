import { Suspense } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthCard
      title="Pierakstīties"
      description="Ievadiet savu e-pastu un paroli, lai turpinātu"
    >
      <Suspense fallback={<div className="text-sm text-white/40">Ielādē...</div>}>
        <LoginForm />
      </Suspense>

      <div className="mt-6 text-center font-accent text-sm text-white/45">
        Vēl nav konta?{" "}
        <Link
          href="/register"
          className="font-bold text-white transition hover:text-white/75"
        >
          Izveidot jaunu organizāciju
        </Link>
      </div>
    </AuthCard>
  );
}
