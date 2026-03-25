"use client";

import { useRouter } from "next/navigation";
import type { CreateRoleInput } from "@/application/dtos/role/CreateRoleDTO";
import type { UpdateRoleInput } from "@/application/dtos/role/UpdateRoleDTO";
import { FormTemplate } from "@/components/templates/form-template";
import { FormField } from "@/components/ui/form-field";
import { PermissionSelect } from "@/components/ui/permission-select";
import type { Permission } from "@/domain/enums/Permission";
import { useRoleForm } from "@/features/roles/hooks/useRoleForm";

interface RoleFormProps {
  mode: "create" | "edit";
  roleId?: string;
}

export function RoleForm({ mode, roleId }: RoleFormProps) {
  const router = useRouter();
  const { form, isLoading, isFetching, onSubmit, isEdit } = useRoleForm({
    mode,
    roleId,
  });

  const handleCancel = () => {
    router.push("/roles");
  };

  const permissions = form.watch("permissions") as Permission[];

  type FormData = CreateRoleInput | UpdateRoleInput;

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <FormTemplate>
      <FormTemplate.Form<FormData> form={form} onSubmit={onSubmit}>
        <FormTemplate.Content>
          <FormField<FormData>
            form={form}
            name="name"
            label="Nome"
            placeholder="Nome do cargo do sistema"
            required
          />

          <FormField<FormData>
            form={form}
            name="description"
            label="Descrição"
            placeholder="Descrição opcional"
          />

          <FormField<FormData>
            form={form}
            name="permissions"
            label="Permissões"
            required
          >
            <PermissionSelect
              value={permissions || []}
              onChange={(perms) => form.setValue("permissions", perms as never)}
            />
          </FormField>
        </FormTemplate.Content>

        <FormTemplate.Footer
          onCancel={handleCancel}
          isLoading={isLoading}
          submitLabel={isEdit ? "Salvar" : "Criar"}
        />
      </FormTemplate.Form>
    </FormTemplate>
  );
}
