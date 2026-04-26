"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/features/auth/hooks/useAuth";

const ServiceTemplateFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  dayOfWeek: z.enum([
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:mm)"),
  location: z.string().optional(),
  isActive: z.boolean(),
});

export type ServiceTemplateFormValues = z.infer<
  typeof ServiceTemplateFormSchema
>;

interface UseServiceTemplateFormProps {
  mode: "create" | "edit";
  templateId?: string;
  goBack: () => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function useServiceTemplateForm({
  mode,
  templateId,
  goBack,
  onSuccess,
  onError,
}: UseServiceTemplateFormProps) {
  const { user } = useAuth();
  const churchId = user?.churchId ?? null;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === "edit");

  const form = useForm<ServiceTemplateFormValues>({
    resolver: zodResolver(ServiceTemplateFormSchema),
    defaultValues: {
      title: "",
      dayOfWeek: "Sunday",
      time: "19:00",
      location: "",
      isActive: true,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (mode === "edit" && templateId) {
      const fetchTemplate = async () => {
        setIsFetching(true);
        try {
          const response = await fetch(`/api/service-templates/${templateId}`);
          const data = await response.json();

          if (data.ok && data.value) {
            const templateData = data.value;
            form.reset({
              title: templateData.title,
              dayOfWeek: templateData.dayOfWeek,
              time: templateData.time,
              location: templateData.location ?? "",
              isActive: templateData.isActive,
            });
          } else {
            toast.error("Modelo de culto não encontrado");
            goBack();
          }
        } catch {
          toast.error("Erro ao carregar dados do modelo");
          goBack();
        } finally {
          setIsFetching(false);
        }
      };

      fetchTemplate();
    }
  }, [mode, templateId, form, goBack]);

  const onSubmit = async (formData: ServiceTemplateFormValues) => {
    if (!churchId) {
      toast.error("Nenhuma igreja selecionada");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "create") {
        const response = await fetch(`/api/service-templates`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.ok) {
          const message = "Modelo de culto criado com sucesso!";
          onSuccess?.(message);
          goBack();
        } else {
          const errorMessage =
            data.error?.message || "Erro ao criar modelo de culto";
          onError?.(errorMessage);
          toast.error(errorMessage);
        }
      } else {
        if (!templateId) return;

        const payload = {
          title: formData.title,
          dayOfWeek: formData.dayOfWeek,
          time: formData.time,
          location: formData.location,
          isActive: formData.isActive,
        };

        const response = await fetch(`/api/service-templates/${templateId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.ok) {
          const message = "Modelo de culto atualizado com sucesso!";
          onSuccess?.(message);
          goBack();
        } else {
          const errorMessage =
            data.error?.message || "Erro ao atualizar modelo de culto";
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
