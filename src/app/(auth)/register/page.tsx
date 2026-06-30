import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Izveidot organizāciju"
      description="Organizācija + pirmais administratora konts"
    >
      <RegisterForm />
      <div className="mt-6 text-center font-accent text-sm text-white/45">
        Jau ir konts?{" "}
        <Link
          href="/login"
          className="font-bold text-white transition hover:text-white/75"
        >
          Pieslēgties
        </Link>
      </div>
    </AuthCard>
  );
}
