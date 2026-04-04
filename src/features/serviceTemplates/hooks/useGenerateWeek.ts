"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";

export interface GenerateWeekResult {
  createdCount: number;
  skippedCount: number;
  services: {
    id: string;
    title: string;
    date: string;
    time: string;
  }[];
}

export function useGenerateWeek() {
  const { user } = useAuth();
  const churchId = user?.churchId ?? null;

  const [isLoading, setIsLoading] = useState(false);

  const generateWeek = async (
    weekStartDate: Date,
  ): Promise<GenerateWeekResult | null> => {
    if (!churchId) {
      toast.error("Nenhuma igreja selecionada");
      return null;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/service-templates/generate-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchId,
          weekStartDate: weekStartDate.toISOString(),
        }),
      });

      const data = await response.json();

      if (data.ok) {
        return data.value as GenerateWeekResult;
      } else {
        toast.error(data.error?.message || "Erro ao gerar cultos da semana");
        return null;
      }
    } catch {
      toast.error("Ocorreu um erro. Tente novamente.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateWeek,
    isLoading,
  };
}
