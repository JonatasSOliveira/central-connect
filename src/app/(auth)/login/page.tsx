"use client";

import { Church } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLoginScreen } from "@/features/auth/hooks/useLoginScreen";

export default function LoginPage() {
  const { isLoading, error, handleGoogleLogin } = useLoginScreen();

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm flex flex-col items-center animate-in fade-in zoom-in duration-500 flex-1 justify-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center">
            <Church className="w-12 h-12 text-primary" strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-[10px] font-bold">
              CC
            </span>
          </div>
        </div>

        <h1 className="font-heading text-2xl font-bold text-foreground text-center leading-tight">
          Central Connect
        </h1>
        <p className="text-muted-foreground text-center mt-2 text-sm">
          Gestão de escalas ministeriais
        </p>

        {error && (
          <div className="w-full mt-6 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        <div className="w-full mt-8 space-y-4">
          <Button
            size="lg"
            className="w-full h-12 text-base font-medium gap-3"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isLoading ? "Entrando..." : "Entrar com o Google"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-8 text-center">
          Made for Ministries
        </p>
      </div>
    </div>
  );
}
