"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { signInWithGoogle } from "@/infra/firebase-client/services/googleAuth";
import { useAuth } from "./useAuth";

interface UseLoginScreenReturn {
  isLoading: boolean;
  error: string | null;
  handleGoogleLogin: () => Promise<void>;
}

export function useLoginScreen(): UseLoginScreenReturn {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const firebaseUser = await signInWithGoogle();
      await login(firebaseUser.idToken);
      router.push("/home");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao fazer login";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [login, router]);

  return {
    isLoading,
    error,
    handleGoogleLogin,
  };
}
