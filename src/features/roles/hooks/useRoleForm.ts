"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type CreateRoleInput,
  CreateRoleInputSchema,
} from "@/application/dtos/role/CreateRoleDTO";
import {
  type UpdateRoleInput,
  UpdateRoleInputSchema,
} from "@/application/dtos/role/UpdateRoleDTO";
import { Permission } from "@/domain/enums/Permission";

interface UseRoleFormProps {
  mode: "create" | "edit";
  roleId?: string;
}

interface UseRoleFormReturn {
  form: ReturnType<typeof useForm<CreateRoleInput | UpdateRoleInput>>;
  isLoading: boolean;
  isFetching: boolean;
  onSubmit: (data: CreateRoleInput | UpdateRoleInput) => Promise<void>;
  isEdit: boolean;
}

const _defaultPermissions = Object.values(Permission);

export function useRoleForm({
  mode,
  roleId,
}: UseRoleFormProps): UseRoleFormReturn {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === "edit");

  const form = useForm<CreateRoleInput | UpdateRoleInput>({
    resolver: zodResolver(
      mode === "create" ? CreateRoleInputSchema : UpdateRoleInputSchema,
    ),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (mode === "edit" && roleId) {
      const fetchRole = async () => {
        setIsFetching(true);
        try {
          const response = await fetch(`/api/roles/${roleId}`);
          const data = await response.json();

          if (data.ok && data.value) {
            form.reset({
              name: data.value.name,
              description: data.value.description ?? "",
              permissions: data.value.permissions,
            });
          } else {
            toast.error("Cargo do sistema não encontrado");
            router.push("/roles");
          }
        } catch {
          toast.error("Erro ao carregar dados do cargo do sistema");
        } finally {
          setIsFetching(false);
        }
      };

      fetchRole();
    }
  }, [mode, roleId, form, router]);

  const onSubmit = async (formData: CreateRoleInput | UpdateRoleInput) => {
    setIsLoading(true);

    try {
      if (mode === "create") {
        const response = await fetch("/api/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.ok) {
          toast.success("Cargo do sistema criado com sucesso!");
          router.push("/roles");
        } else {
          toast.error(data.error?.message || "Erro ao criar cargo do sistema");
        }
      } else {
        if (!roleId) return;

        const response = await fetch(`/api/roles/${roleId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.ok) {
          toast.success("Cargo do sistema atualizado com sucesso!");
          router.push("/roles");
        } else {
          toast.error(
            data.error?.message || "Erro ao atualizar cargo do sistema",
          );
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
  };
}
