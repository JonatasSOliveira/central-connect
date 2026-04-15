"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { signInWithGoogle } from "@/infra/firebase-client/services/googleAuth";
import { normalizePhone } from "@/shared/utils/phone";
import { useAuthStore } from "@/stores/authStore";

interface SelfSignupContext {
  churchId: string;
  churchName: string;
  canProceed: boolean;
  selfSignupEnabled: boolean;
  hasDefaultRoleConfigured: boolean;
  defaultRoleId: string | null;
  message: string | null;
}

interface SignupFormState {
  fullName: string;
  phone: string;
}

interface UseSelfSignupReturn {
  context: SelfSignupContext | null;
  form: SignupFormState;
  isFetchingContext: boolean;
  isLookingUpPhone: boolean;
  isSubmitting: boolean;
  phoneConfirmed: boolean;
  error: string | null;
  updateField: (field: keyof SignupFormState, value: string) => void;
  lookupByPhone: () => Promise<void>;
  finalizeWithGoogle: () => Promise<void>;
}

export function useSelfSignup(churchId: string): UseSelfSignupReturn {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [context, setContext] = useState<SelfSignupContext | null>(null);
  const [form, setForm] = useState<SignupFormState>({
    fullName: "",
    phone: "",
  });
  const [isFetchingContext, setIsFetchingContext] = useState(true);
  const [isLookingUpPhone, setIsLookingUpPhone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneConfirmed, setPhoneConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContext = async () => {
      setIsFetchingContext(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/public/churches/${churchId}/self-signup-context`,
        );
        const data = await response.json();

        if (!response.ok || !data.ok) {
          setError(data.error?.message ?? "Não foi possível carregar a igreja");
          return;
        }

        setContext(data.value);
      } catch {
        setError("Não foi possível carregar a igreja");
      } finally {
        setIsFetchingContext(false);
      }
    };

    fetchContext();
  }, [churchId]);

  const updateField = useCallback(
    (field: keyof SignupFormState, value: string) => {
      setForm((state) => ({ ...state, [field]: value }));
    },
    [],
  );

  const lookupByPhone = useCallback(async () => {
    const phone = normalizePhone(form.phone);

    if (!phone) {
      setError("Informe o telefone para continuar");
      return;
    }

    setIsLookingUpPhone(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/public/churches/${churchId}/self-signup/member-lookups`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        },
      );
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(
          data.error?.message ?? "Não foi possível consultar o telefone",
        );
        return;
      }

      if (data.value.memberExists && data.value.prefill) {
        setForm((state) => ({
          ...state,
          fullName: data.value.prefill.fullName || state.fullName,
          phone: normalizePhone(data.value.prefill.phone) || state.phone,
        }));
      }

      setPhoneConfirmed(true);
    } catch {
      setError("Não foi possível consultar o telefone");
    } finally {
      setIsLookingUpPhone(false);
    }
  }, [churchId, form.phone]);

  const finalizeWithGoogle = useCallback(async () => {
    if (!context?.canProceed) {
      setError(context?.message ?? "Auto cadastro indisponível");
      return;
    }

    if (!form.fullName.trim()) {
      setError("Informe o nome completo");
      return;
    }

    const phone = normalizePhone(form.phone);
    if (!phone) {
      setError("Informe o telefone para continuar");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const firebaseUser = await signInWithGoogle();

      const finalizeResponse = await fetch(
        `/api/public/churches/${churchId}/self-signups`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            googleToken: firebaseUser.idToken,
            fullName: form.fullName,
            phone,
          }),
        },
      );

      const finalizeData = await finalizeResponse.json();

      if (!finalizeResponse.ok || !finalizeData.ok) {
        setError(finalizeData.error?.message ?? "Não foi possível finalizar");
        return;
      }

      const loginResult = await login(firebaseUser.idToken);
      if (loginResult.errorMessage) {
        setError(loginResult.errorMessage);
        return;
      }

      router.push("/select-church");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível finalizar";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [churchId, context, form.fullName, form.phone, login, router]);

  return {
    context,
    form,
    isFetchingContext,
    isLookingUpPhone,
    isSubmitting,
    phoneConfirmed,
    error,
    updateField,
    lookupByPhone,
    finalizeWithGoogle,
  };
}
