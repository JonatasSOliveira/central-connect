"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import type {
  MinistryDetailDTO,
  MinistryFormInput,
} from "@/application/dtos/ministry/MinistryDTO";
import { MinistryFormSchema } from "@/application/dtos/ministry/MinistryDTO";
import { useAuthStore } from "@/stores/authStore";

interface MemberOption {
  id: string;
  fullName: string;
}

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
  memberOptions: MemberOption[];
}

export function useMinistryForm({
  mode,
  ministryId,
}: UseMinistryFormProps): UseMinistryFormReturn {
  const router = useRouter();
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === "edit");
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [_isLoadingMembers, setIsLoadingMembers] = useState(false);

  const churchId = user?.churchId ?? null;

  const form = useForm<MinistryFormInput>({
    resolver: zodResolver(MinistryFormSchema),
    defaultValues: {
      name: "",
      leaderId: null,
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
    const fetchMembers = async () => {
      if (!churchId) {
        setMembers([]);
        return;
      }

      setIsLoadingMembers(true);
      try {
        const response = await fetch(`/api/members?churchId=${churchId}`);
        const data = await response.json();
        if (data.ok) {
          const membersData = data.value.members.map(
            (m: { id: string; fullName: string }) => ({
              id: m.id,
              fullName: m.fullName,
            }),
          );
          setMembers(membersData);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [churchId]);

  const memberOptions = useMemo(() => {
    if (!churchId) {
      return [];
    }
    return members;
  }, [members, churchId]);

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
              name: ministryData.name,
              leaderId: ministryData.leaderId,
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
    memberOptions,
  };
}
