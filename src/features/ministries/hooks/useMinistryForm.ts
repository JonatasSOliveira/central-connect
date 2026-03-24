"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ChurchListItemDTO } from "@/application/dtos/church/ChurchDTO";
import type {
  MinistryDetailDTO,
  MinistryFormData,
  MinistryFormInput,
} from "@/application/dtos/ministry/MinistryDTO";
import { MinistryFormSchema } from "@/application/dtos/ministry/MinistryDTO";
import { Permission } from "@/domain/enums/Permission";
import { useAuthStore } from "@/stores/authStore";

interface UseMinistryFormProps {
  mode: "create" | "edit";
  ministryId?: string;
}

export interface UseMinistryFormReturn {
  form: ReturnType<typeof useForm<MinistryFormInput>>;
  editableFields: ReturnType<
    typeof useFieldArray<MinistryFormInput, "roles">
  >["fields"];
  editableAppend: ReturnType<
    typeof useFieldArray<MinistryFormInput, "roles">
  >["append"];
  editableRemove: ReturnType<
    typeof useFieldArray<MinistryFormInput, "roles">
  >["remove"];
  isLoading: boolean;
  isFetching: boolean;
  onSubmit: (data: MinistryFormInput) => Promise<void>;
  isEdit: boolean;
  editableChurches: ChurchListItemDTO[];
  canChangeChurch: boolean;
  defaultChurchId: string;
}

export function useMinistryForm({
  mode,
  ministryId,
}: UseMinistryFormProps): UseMinistryFormReturn {
  const router = useRouter();
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === "edit");
  const [editableChurches, setEditableChurches] = useState<ChurchListItemDTO[]>(
    [],
  );

  const isSuperAdmin = user?.isSuperAdmin ?? false;
  const hasMinistryWrite =
    user?.permissions?.includes(Permission.MINISTRY_WRITE) ?? false;
  const canChangeChurch = isSuperAdmin || hasMinistryWrite;

  const userChurches = user?.churches ?? [];
  const userWritableChurchIds = useMemo(() => {
    if (isSuperAdmin) {
      return userChurches.map((c) => c.churchId);
    }
    return hasMinistryWrite ? userChurches.map((c) => c.churchId) : [];
  }, [isSuperAdmin, hasMinistryWrite, userChurches]);

  const hasSingleWritableChurch = userWritableChurchIds.length === 1;
  const defaultChurchId = hasSingleWritableChurch
    ? userWritableChurchIds[0]
    : "";

  const form = useForm<MinistryFormInput>({
    resolver: zodResolver(MinistryFormSchema),
    defaultValues: {
      churchId: defaultChurchId,
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
    const fetchEditableChurches = async () => {
      if (!canChangeChurch) {
        return;
      }

      try {
        if (isSuperAdmin) {
          const response = await fetch("/api/churches");
          const data = await response.json();
          if (data.ok) {
            setEditableChurches(data.value.churches);
          }
        } else {
          const allChurchesResponse = await fetch("/api/churches");
          const allChurchesData = await allChurchesResponse.json();
          if (allChurchesData.ok) {
            const filteredChurches = allChurchesData.value.churches.filter(
              (church: ChurchListItemDTO) =>
                userWritableChurchIds.includes(church.id),
            );
            setEditableChurches(filteredChurches);
          }
        }
      } catch (error) {
        console.error("Error fetching editable churches:", error);
      }
    };

    fetchEditableChurches();
  }, [canChangeChurch, isSuperAdmin, userWritableChurchIds]);

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
              churchId: ministryData.churchId,
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
    editableFields: fields,
    editableAppend: append,
    editableRemove: remove,
    isLoading,
    isFetching,
    onSubmit,
    isEdit: mode === "edit",
    editableChurches,
    canChangeChurch,
    defaultChurchId,
  };
}
