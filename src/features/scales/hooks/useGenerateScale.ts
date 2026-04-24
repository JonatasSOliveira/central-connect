"use client";

import { useMemo, useState } from "react";
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

type GenerateScaleInput = {
  serviceId: string;
  ministryId: string;
};

export function useGenerateScale() {
  const { user } = useAuth();
  const churchId = user?.churchId ?? null;

  const [services, setServices] = useState<ServiceOption[]>([]);
  const [ministries, setMinistries] = useState<MinistryOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const serviceOptions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return services
      .filter((service) => {
        const serviceDate = new Date(service.date);
        serviceDate.setHours(0, 0, 0, 0);
        return serviceDate >= today;
      })
      .sort((a, b) => {
        const aDateTime = `${new Date(a.date).toISOString().slice(0, 10)}T${a.time || "00:00"}`;
        const bDateTime = `${new Date(b.date).toISOString().slice(0, 10)}T${b.time || "00:00"}`;
        return aDateTime.localeCompare(bDateTime);
      })
      .map((service) => {
        const date = new Date(service.date);
        const formattedDate = date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        return {
          value: service.id,
          label: `${service.title} - ${formattedDate} ${service.time}`,
        };
      });
  }, [services]);

  const ministryOptions = useMemo(
    () =>
      ministries
        .map((ministry) => ({ value: ministry.id, label: ministry.name }))
        .sort((a, b) => a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" })),
    [ministries],
  );

  const loadOptions = async () => {
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
  };

  const generateScale = async ({
    serviceId,
    ministryId,
  }: GenerateScaleInput): Promise<boolean> => {
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
        return true;
      }

      if (data.error?.code === "SCALE_ALREADY_EXISTS") {
        toast.error("Já existe uma escala para esse culto e ministério");
        return false;
      }

      toast.error(data.error?.message || "Não foi possível gerar a escala");
      return false;
    } catch {
      toast.error("Ocorreu um erro. Tente novamente.");
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    serviceOptions,
    ministryOptions,
    isLoadingOptions,
    isGenerating,
    loadOptions,
    generateScale,
  };
}
