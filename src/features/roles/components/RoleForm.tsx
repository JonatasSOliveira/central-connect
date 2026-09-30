"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { SubmitErrorHandler } from "react-hook-form";
import { toast } from "sonner";
import { FormTemplate } from "@/components/templates/form-template";
import { FormField } from "@/components/ui/form-field";
import { PermissionSelect } from "@/components/ui/permission-select";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRoleForm } from "@/features/roles/hooks/useRoleForm";
import type { CreateRoleInput } from "@/modules/roles/presentation/contracts/role/CreateRoleDTO";
import type { UpdateRoleInput } from "@/modules/roles/presentation/contracts/role/UpdateRoleDTO";
import type { Permission } from "@/shared/domain/enums/Permission";

interface RoleFormProps {
  mode: "create" | "edit";
  roleId?: string;
}

export function RoleForm({ mode, roleId }: RoleFormProps) {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { form, isLoading, isFetching, onSubmit, isEdit } = useRoleForm({
    mode,
    roleId,
  });

  const handleCancel = () => {
    router.push("/roles");
  };

  const permissions = form.watch("permissions") as Permission[];

  type FormData = CreateRoleInput | UpdateRoleInput;

  const handleInvalidSubmit: SubmitErrorHandler<FormData> = (errors) => {
    console.warn("[RoleForm] validation errors:", errors);
    toast.error("Revise os campos obrigatórios antes de salvar.");
  };

  const canManageRoles = user?.isSuperAdmin ?? false;

  useEffect(() => {
    if (!isAuthLoading && !canManageRoles) {
      router.replace("/roles");
    }
  }, [canManageRoles, isAuthLoading, router]);

  if (isAuthLoading || isFetching || !canManageRoles) {
    return (
      <div
        className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm">Carregando dados do cargo...</p>
      </div>
    );
  }

  return (
    <FormTemplate>
      <FormTemplate.Form<FormData>
        form={form}
        onSubmit={onSubmit}
        onInvalid={handleInvalidSubmit}
      >
        <FormTemplate.Content className="space-y-4 pt-0">
          <FormTemplate.Section
            id="role-data-heading"
            title="Dados do cargo"
            description="Informe um nome fácil de reconhecer para este cargo."
          >
            <FormField<FormData>
              form={form}
              name="name"
              label="Nome do cargo"
              placeholder="Ex.: Líder de membros"
              required
              autoFocus
            />
          </FormTemplate.Section>

          <FormTemplate.Section
            id="role-description-heading"
            title="Descrição"
            description="Explique brevemente a responsabilidade deste cargo."
          >
            <FormField<FormData>
              form={form}
              name="description"
              label="Descrição do cargo"
              placeholder="Descreva o que este cargo pode fazer"
            />
          </FormTemplate.Section>

          <FormTemplate.Section
            id="role-permissions-heading"
            title="Acessos permitidos"
            description="Escolha quais áreas do sistema este cargo poderá acessar."
          >
            <FormField<FormData>
              form={form}
              name="permissions"
              label="Permissões do cargo"
              required
            >
              <PermissionSelect
                value={permissions || []}
                onChange={(perms) =>
                  form.setValue("permissions", perms as never, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }
                disabled={isLoading}
              />
            </FormField>
          </FormTemplate.Section>
        </FormTemplate.Content>

        <FormTemplate.Footer
          onCancel={handleCancel}
          isLoading={isLoading}
          submitLabel={isEdit ? "Salvar alterações" : "Cadastrar cargo"}
        />
      </FormTemplate.Form>
    </FormTemplate>
  );
}
