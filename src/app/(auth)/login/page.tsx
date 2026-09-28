"use client";

import { LoginBrandPanel } from "@/features/auth/components/LoginBrandPanel";
import { LoginCard } from "@/features/auth/components/LoginCard";
import { useLoginScreen } from "@/features/auth/hooks/useLoginScreen";

export default function LoginPage() {
  const { isLoading, error, handleGoogleLogin } = useLoginScreen();

  return (
    <div className="flex min-h-dvh flex-col bg-background lg:flex-row">
      <LoginBrandPanel />
      <section className="flex flex-1 items-start justify-center px-5 py-8 sm:px-8 sm:py-12 lg:items-center lg:px-12 lg:py-16">
        <LoginCard
          error={error}
          isLoading={isLoading}
          onGoogleLogin={handleGoogleLogin}
        />
      </section>
    </div>
  );
}
