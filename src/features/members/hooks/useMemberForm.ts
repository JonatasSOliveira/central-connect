"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ChurchListItemDTO } from "@/application/dtos/church/ChurchDTO";
import {
  type CreateMemberInput,
  CreateMemberInputSchema,
} from "@/application/dtos/member/CreateMemberDTO";
import type { RoleListItem } from "@/application/dtos/role/ListRolesDTO";

interface UseMemberFormProps {
  mode: "create" | "edit";
  memberId?: string;
}

interface UseMemberFormReturn {
  form: ReturnType<typeof useForm<CreateMemberInput>>;
  isLoading: boolean;
  isFetching: boolean;
  onSubmit: (data: CreateMemberInput) => Promise<void>;
  isEdit: boolean;
  roles: RoleListItem[];
  churches: ChurchListItemDTO[];
}

export function useMemberForm({
  mode,
  memberId,
}: UseMemberFormProps): UseMemberFormReturn {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === "edit");
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [churches, setChurches] = useState<ChurchListItemDTO[]>([]);

  const form = useForm<CreateMemberInput>({
    resolver: zodResolver(CreateMemberInputSchema),
    defaultValues: {
      email: "",
      fullName: "",
      phone: "",
      churchId: "",
      roleId: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch("/api/roles");
        const data = await response.json();
        if (data.ok) {
          setRoles(data.value.roles);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    const fetchChurches = async () => {
      try {
        const response = await fetch("/api/churches");
        const data = await response.json();
        if (data.ok) {
          setChurches(data.value.churches);
        }
      } catch (error) {
        console.error("Error fetching churches:", error);
      }
    };

    fetchRoles();
    fetchChurches();
  }, []);

  useEffect(() => {
    if (mode === "edit" && memberId) {
      const fetchMember = async () => {
        setIsFetching(true);
        try {
          const response = await fetch(`/api/members/${memberId}`);
          const data = await response.json();

          if (data.ok && data.value) {
            form.reset({
              email: data.value.email,
              fullName: data.value.fullName,
              phone: data.value.phone ?? "",
              churchId: data.value.churchId ?? "",
              roleId: data.value.roleId ?? "",
            });
          } else {
            toast.error("Membro não encontrado");
            router.push("/members");
          }
        } catch {
          toast.error("Erro ao carregar dados do membro");
        } finally {
          setIsFetching(false);
        }
      };

      fetchMember();
    }
  }, [mode, memberId, form, router]);

  const onSubmit = async (formData: CreateMemberInput) => {
    setIsLoading(true);

    try {
      if (mode === "create") {
        const response = await fetch("/api/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.ok) {
          toast.success("Membro criado com sucesso!");
          router.push("/members");
        } else {
          toast.error(data.error?.message || "Erro ao criar membro");
        }
      } else {
        if (!memberId) return;

        const response = await fetch(`/api/members/${memberId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.ok) {
          toast.success("Membro atualizado com sucesso!");
          router.push("/members");
        } else {
          toast.error(data.error?.message || "Erro ao atualizar membro");
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
    onSubmit,
    isEdit: mode === "edit",
    roles,
    churches,
  };
}
