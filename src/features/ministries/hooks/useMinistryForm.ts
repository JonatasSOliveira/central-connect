"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import type {
  MinistryDetailDTO,
  MinistryFormData,
  MinistryFormInput,
} from "@/application/dtos/ministry/MinistryDTO";
import { MinistryFormSchema } from "@/application/dtos/ministry/MinistryDTO";
import { useAuthStore } from "@/stores/authStore";

interface UseMinistryFormProps {
  mode: "create" | "edit";
  ministryId?: string;
}

export function useMinistryForm({ mode, ministryId }: UseMinistryFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === "edit");

  const churchId = useMemo(() => {
    return user?.churches[0]?.churchId ?? "";
  }, [user]);

  const form = useForm<MinistryFormInput>({
    resolver: zodResolver(MinistryFormSchema),
    defaultValues: {
      churchId: "",
      name: "",
      minMembersPerService: 1,
      idealMembersPerService: 2,
      notes: "",
      roles: [],
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "roles",
  });

  useEffect(() => {
    if (mode === "edit" && ministryId) {
      const fetchMinistry = async () => {
        setIsFetching(true);
        try {
          const response = await fetch(`/api/ministries/${ministryId}`);
          const data = await response.json();

          if (data.ok && data.value) {
            const ministryData: MinistryDetailDTO = data.value.ministry;
            form.reset({
              churchId: ministryData.id.split("/")[0],
              name: ministryData.name,
              minMembersPerService: ministryData.minMembersPerService,
              idealMembersPerService: ministryData.idealMembersPerService,
              notes: ministryData.notes ?? "",
              roles: ministryData.roles.map((r) => ({
                id: r.id,
                name: r.name,
              })),
            });
          } else {
            toast.error("Ministério não encontrado");
            router.push("/ministries");
          }
        } catch {
          toast.error("Erro ao carregar dados do ministério");
        } finally {
          setIsFetching(false);
        }
      };

      fetchMinistry();
    }
  }, [mode, ministryId, form, router]);

  useEffect(() => {
    if (churchId && mode === "create") {
      form.setValue("churchId", churchId);
    }
  }, [churchId, mode, form]);

  const onSubmit = useCallback(
    async (formData: MinistryFormInput) => {
      setIsLoading(true);

      try {
        if (mode === "create") {
          const response = await fetch("/api/ministries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });

          const data = await response.json();

          if (data.ok) {
            toast.success("Ministério criado com sucesso!");
            router.push("/ministries");
          } else {
            toast.error(data.error?.message || "Erro ao criar ministério");
          }
        } else {
          if (!ministryId) return;

          const response = await fetch(`/api/ministries/${ministryId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });

          const data = await response.json();

          if (data.ok) {
            toast.success("Ministério atualizado com sucesso!");
            router.push("/ministries");
          } else {
            toast.error(data.error?.message || "Erro ao atualizar ministério");
          }
        }
      } catch {
        toast.error("Ocorreu um erro. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    },
    [mode, ministryId, router],
  );

  return {
    form,
    fields,
    append,
    remove,
    isLoading,
    isFetching,
    onSubmit,
    isEdit: mode === "edit",
    churchId,
  };
}
