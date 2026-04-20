"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  signInWithGoogle,
  signInWithGoogleRedirect,
} from "@/infra/firebase-client/services/googleAuth";
import { normalizePhone } from "@/shared/utils/phone";
import { useAuthStore } from "@/stores/authStore";
import {
  fetchSelfSignupContext,
  lookupSelfSignupPhone,
  type SelfSignupContext,
} from "./selfSignupApi";
import { finalizeSelfSignupAndLogin } from "./selfSignupFinalize";
import {
  clearSelfSignupRedirectPayload,
  setSelfSignupRedirectPayload,
  type SelfSignupRedirectPayload,
} from "./selfSignupRedirectStorage";
import type { SignupFormState, UseSelfSignupReturn } from "./selfSignupTypes";
import {
  isLocalhostRuntime,
  useSelfSignupRedirectFlow,
} from "./useSelfSignupRedirectFlow";

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

  const finalizeSignupWithToken = useCallback(
    async (googleToken: string, payload: SelfSignupRedirectPayload) => {
      await finalizeSelfSignupAndLogin({
        googleToken,
        payload,
        login,
        onSuccess: () => {
          router.push("/select-church");
        },
      });
    },
    [login, router],
  );

  const onRedirectError = useCallback((message: string) => {
    setError(message);
  }, []);

  const { isProcessingRedirect } = useSelfSignupRedirectFlow({
    churchId,
    finalizeSignupWithToken,
    onError: onRedirectError,
  });

  useEffect(() => {
    const fetchContext = async () => {
      setIsFetchingContext(true);
      setError(null);

      try {
        const loadedContext = await fetchSelfSignupContext(churchId);
        setContext(loadedContext);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Não foi possível carregar a igreja";
        setError(message);
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
      const lookup = await lookupSelfSignupPhone(churchId, phone);

      if (lookup.memberExists && lookup.prefill) {
        const prefill = lookup.prefill;
        setForm((state) => ({
          ...state,
          fullName: prefill.fullName || state.fullName,
          phone: normalizePhone(prefill.phone) || state.phone,
        }));
      }

      setPhoneConfirmed(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível consultar o telefone";
      setError(message);
    } finally {
      setIsLookingUpPhone(false);
    }
  }, [churchId, form.phone]);

  const finalizeWithGoogle = useCallback(
    async (acceptedTerms: boolean) => {
      if (!context?.canProceed) {
        setError(context?.message ?? "Auto cadastro indisponível");
        return;
      }

      if (!acceptedTerms) {
        setError("Aceite os termos para continuar");
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
        const payload: Omit<SelfSignupRedirectPayload, "createdAt"> = {
          churchId,
          fullName: form.fullName,
          phone,
          acceptedTerms,
        };

        if (isLocalhostRuntime()) {
          const firebaseUser = await signInWithGoogle();
          await finalizeSignupWithToken(firebaseUser.idToken, {
            ...payload,
            createdAt: Date.now(),
          });
          return;
        }

        setSelfSignupRedirectPayload(payload);
        await signInWithGoogleRedirect();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Não foi possível finalizar";
        setError(message);
        clearSelfSignupRedirectPayload();
      } finally {
        setIsSubmitting(false);
      }
    },
    [churchId, context, finalizeSignupWithToken, form.fullName, form.phone],
  );

  return {
    context,
    form,
    isFetchingContext,
    isLookingUpPhone,
    isSubmitting: isSubmitting || isProcessingRedirect,
    phoneConfirmed,
    error,
    updateField,
    lookupByPhone,
    finalizeWithGoogle,
  };
}
