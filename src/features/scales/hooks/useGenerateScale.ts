"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";

type ServiceOption = {
  id: string;
  title: string;
  date: string | Date;
  time: string;
};

type MinistryOption = {
  id: string;
  name: string;
};

type GenerateScaleInput = { serviceId: string; ministryId: string };

type ExistingScale = {
  id: string;
  status: "draft" | "published";
};

export function useGenerateScale() {
  const { user } = useAuth();
  const churchId = user?.churchId ?? null;

  const [services, setServices] = useState<ServiceOption[]>([]);
  const [ministries, setMinistries] = useState<MinistryOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);
  const [existingScale, setExistingScale] = useState<ExistingScale | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const checkRequestIdRef = useRef(0);

  const sortedMinistries = useMemo(
    () =>
      [...ministries].sort((a, b) =>
        a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }),
      ),
    [ministries],
  );

  const loadOptions = useCallback(async () => {
    if (!churchId) {
      toast.error("Nenhuma igreja selecionada");
      return;
    }

    setIsLoadingOptions(true);
    try {
      const [servicesRes, ministriesRes] = await Promise.all([
        fetch(`/api/services?churchId=${churchId}`),
        fetch(`/api/ministries?churchId=${churchId}`),
      ]);

      const [servicesData, ministriesData] = await Promise.all([
        servicesRes.json(),
        ministriesRes.json(),
      ]);

      if (servicesData.ok) {
        setServices(servicesData.value.services);
      }

      if (ministriesData.ok) {
        setMinistries(ministriesData.value.ministries);
      }
    } catch {
      toast.error("Não foi possível carregar cultos e ministérios");
    } finally {
      setIsLoadingOptions(false);
    }
  }, [churchId]);

  const resetExistingScaleCheck = useCallback(() => {
    checkRequestIdRef.current += 1;
    setIsCheckingExisting(false);
    setExistingScale(null);
    setCheckError(null);
  }, []);

  const checkExistingScale = useCallback(
    async ({
      serviceId,
      ministryId,
    }: GenerateScaleInput): Promise<ExistingScale | null> => {
      if (!churchId || !serviceId || !ministryId) {
        resetExistingScaleCheck();
        return null;
      }

      const requestId = ++checkRequestIdRef.current;
      setIsCheckingExisting(true);
      setCheckError(null);

      try {
        const params = new URLSearchParams({
          churchId,
          serviceId,
          ministryId,
        });

        const response = await fetch(`/api/scales?${params.toString()}`);
        const data = await response.json();

        if (requestId !== checkRequestIdRef.current) {
          return null;
        }

        if (!data.ok) {
          setExistingScale(null);
          setCheckError("Nao foi possivel verificar escala existente");
          return null;
        }

        const found = data.value?.scales?.[0];
        if (!found?.id) {
          setExistingScale(null);
          return null;
        }

        const scale: ExistingScale = {
          id: found.id,
          status: found.status === "published" ? "published" : "draft",
        };

        setExistingScale(scale);
        return scale;
      } catch {
        if (requestId !== checkRequestIdRef.current) return null;

        setExistingScale(null);
        setCheckError("Nao foi possivel verificar escala existente");
        return null;
      } finally {
        if (requestId === checkRequestIdRef.current) {
          setIsCheckingExisting(false);
        }
      }
    },
    [churchId, resetExistingScaleCheck],
  );

  const generateScale = useCallback(
    async ({
      serviceId,
      ministryId,
    }: GenerateScaleInput): Promise<{ ok: boolean; scaleId?: string }> => {
      setIsGenerating(true);
      try {
        const response = await fetch("/api/scales/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serviceId, ministryId }),
        });

        const data = await response.json();

        if (data.ok) {
          toast.success("Escala gerada automaticamente com sucesso");
          return { ok: true, scaleId: data.value?.scale?.id };
        }

        if (data.error?.code === "SCALE_ALREADY_EXISTS") {
          await checkExistingScale({ serviceId, ministryId });
          toast.error("Já existe uma escala para esse culto e ministério");
          return { ok: false };
        }

        toast.error(data.error?.message || "Não foi possível gerar a escala");
        return { ok: false };
      } catch {
        toast.error("Ocorreu um erro. Tente novamente.");
        return { ok: false };
      } finally {
        setIsGenerating(false);
      }
    },
    [checkExistingScale],
  );

  return {
    services,
    ministries: sortedMinistries,
    isLoadingOptions,
    isGenerating,
    isCheckingExisting,
    existingScale,
    checkError,
    loadOptions,
    checkExistingScale,
    resetExistingScaleCheck,
    generateScale,
  };
}
