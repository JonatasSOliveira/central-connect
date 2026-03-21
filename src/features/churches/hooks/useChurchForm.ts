"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type ChurchFormData,
  ChurchFormSchema,
  churchFormDefaultValues,
} from "@/application/dtos/church/ChurchDTO";

interface UseChurchFormProps {
  mode: "create" | "edit";
  churchId?: string;
}

interface UseChurchFormReturn {
  form: ReturnType<typeof useForm<ChurchFormData>>;
  isLoading: boolean;
  isFetching: boolean;
  initialDataLoaded: boolean;
  onSubmit: (data: ChurchFormData) => Promise<void>;
}

export function useChurchForm({
  mode,
  churchId,
}: UseChurchFormProps): UseChurchFormReturn {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === "edit");
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const form = useForm<ChurchFormData>({
    resolver: zodResolver(ChurchFormSchema),
    defaultValues: churchFormDefaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    if (mode === "edit" && churchId) {
      const fetchChurch = async () => {
        setIsFetching(true);
        try {
          const response = await fetch(`/api/churches/${churchId}`);
          const data = await response.json();

          if (data.ok && data.value?.church) {
            form.reset({
              name: data.value.church.name,
            });
            setInitialDataLoaded(true);
          } else {
            toast.error("Igreja não encontrada");
            router.push("/churches");
          }
        } catch {
          toast.error("Erro ao carregar dados da igreja");
        } finally {
          setIsFetching(false);
        }
      };

      fetchChurch();
    }
  }, [mode, churchId, form, router]);

  const onSubmit = async (formData: ChurchFormData) => {
    setIsLoading(true);

    try {
      if (mode === "create") {
        const response = await fetch("/api/churches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.ok) {
          toast.success("Igreja criada com sucesso!");
          router.push("/churches");
        } else {
          toast.error(data.error?.message || "Erro ao criar igreja");
        }
      } else {
        if (!churchId) return;

        const response = await fetch(`/api/churches/${churchId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.ok) {
          toast.success("Igreja atualizada com sucesso!");
          router.push("/churches");
        } else {
          toast.error(data.error?.message || "Erro ao atualizar igreja");
        }
      }
    } catch {
      toast.error("Ocorreu um erro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    isFetching,
    initialDataLoaded,
    onSubmit,
  };
}
