import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Izveidot organizāciju"
      description="Organizācija + pirmais administratora konts."
    >
      <RegisterForm />
      <div className="mt-4 text-center text-xs text-white/45">
        Jau ir konts?{" "}
        <Link href="/login" className="font-semibold text-white underline-offset-4 hover:underline">
          Pieslēgties
        </Link>
      </div>
    </AuthCard>
  );
}
