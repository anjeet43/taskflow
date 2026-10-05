import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen min-h-dvh items-center justify-center bg-bg px-4 py-8 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
