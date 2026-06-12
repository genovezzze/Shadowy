import { AuthCard } from "@/components/auth/auth-card";
import { ForgotForm } from "./forgot-form";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Aizmirsi paroli?"
      description="Ievadiet sava konta e-pastu, un mēs nosūtīsim paroles atjaunošanas saiti."
    >
      <ForgotForm />
    </AuthCard>
  );
}
