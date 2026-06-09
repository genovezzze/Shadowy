import { Card, CardContent } from "@/components/ui/card";
import { ForgotForm } from "./forgot-form";

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Aizmirsi paroli?
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ievadiet sava konta e-pastu, un mēs nosūtīsim paroles atjaunošanas
            saiti.
          </p>
        </div>

        <ForgotForm />
      </CardContent>
    </Card>
  );
}
