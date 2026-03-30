"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useChurchStore } from "@/stores/churchStore";

const ServiceFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:mm)"),
  shift: z.enum(["Manhã", "Tarde", "Noite"]).optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});

export type ServiceFormValues = z.infer<typeof ServiceFormSchema>;

interface UseServiceFormProps {
  mode: "create" | "edit";
  serviceId?: string;
  goBack: () => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function useServiceForm({
  mode,
  serviceId,
  goBack,
  onSuccess,
  onError,
}: UseServiceFormProps) {
  const { selectedChurch } = useChurchStore();
  const churchId = selectedChurch?.id;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === "edit");

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(ServiceFormSchema),
    defaultValues: {
      title: "",
      date: "",
      time: "19:00",
      shift: undefined,
      location: "",
      description: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (mode === "edit" && serviceId) {
      const fetchService = async () => {
        setIsFetching(true);
        try {
          const response = await fetch(`/api/services/${serviceId}`);
          const data = await response.json();

          if (data.ok && data.value) {
            const serviceData = data.value;
            const dateObj = new Date(serviceData.date);
            const dateStr = dateObj.toISOString().split("T")[0];

            form.reset({
              title: serviceData.title,
              date: dateStr,
              time: serviceData.time,
              shift: serviceData.shift as
                | "Manhã"
                | "Tarde"
                | "Noite"
                | undefined,
              location: serviceData.location ?? "",
              description: serviceData.description ?? "",
            });
          } else {
            toast.error("Culto não encontrado");
            goBack();
          }
        } catch {
          toast.error("Erro ao carregar dados do culto");
          goBack();
        } finally {
          setIsFetching(false);
        }
      };

      fetchService();
    }
  }, [mode, serviceId, form, goBack]);

  const onSubmit = async (formData: ServiceFormValues) => {
    if (!churchId) {
      toast.error("Nenhuma igreja selecionada");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "create") {
        const response = await fetch(`/api/services?churchId=${churchId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.ok) {
          const message = "Culto criado com sucesso!";
          onSuccess?.(message);
          goBack();
        } else {
          const errorMessage = data.error?.message || "Erro ao criar culto";
          onError?.(errorMessage);
          toast.error(errorMessage);
        }
      } else {
        if (!serviceId) return;

        const payload = {
          title: formData.title,
          date: formData.date,
          time: formData.time,
          shift: formData.shift,
          location: formData.location,
          description: formData.description,
        };

        const response = await fetch(`/api/services/${serviceId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.ok) {
          const message = "Culto atualizado com sucesso!";
          onSuccess?.(message);
          goBack();
        } else {
          const errorMessage = data.error?.message || "Erro ao atualizar culto";
          onError?.(errorMessage);
          toast.error(errorMessage);
        }
      }
    } catch {
      const errorMessage = "Ocorreu um erro. Tente novamente.";
      onError?.(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    isFetching,
    onSubmit,
    isEdit: mode === "edit",
  };
}
