"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CreateRoleInput } from "@/application/dtos/role/CreateRoleDTO";
import type { UpdateRoleInput } from "@/application/dtos/role/UpdateRoleDTO";
import { PrivateHeader } from "@/components/modules/private-header";
import { Form, FormTemplate } from "@/components/templates/form-template";
import { FormField } from "@/components/ui/form-field";
import { PermissionSelect } from "@/components/ui/permission-select";
import type { Permission } from "@/domain/enums/Permission";
import { useRoleForm } from "@/features/roles/hooks/useRoleForm";

interface RoleFormProps {
  mode: "create" | "edit";
  roleId?: string;
  backHref?: string;
}

export function RoleForm({ mode, roleId, backHref = "/roles" }: RoleFormProps) {
  const router = useRouter();
  const { form, isLoading, isFetching, onSubmit, isEdit } = useRoleForm({
    mode,
    roleId,
  });

  const handleCancel = () => {
    router.push(backHref);
  };

  const title = isEdit ? "Editar Cargo" : "Novo Cargo";
  const subtitle = isEdit
    ? "Altere os dados do cargo"
    : "Preencha os dados do cargo";

  const permissions = form.watch("permissions") as Permission[];

  type FormData = CreateRoleInput | UpdateRoleInput;

  if (isFetching) {
    return (
      <div className="px-4 py-6">
        <PrivateHeader title={title} subtitle={subtitle} backHref={backHref} />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <PrivateHeader title={title} subtitle={subtitle} backHref={backHref} />

      <FormTemplate>
        <Form<FormData> form={form} onSubmit={onSubmit}>
          <FormTemplate.Content>
            <FormField<FormData>
              form={form}
              name="name"
              label="Nome"
              placeholder="Nome do cargo"
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
                onChange={(perms) => form.setValue("permissions", perms as any)}
              />
            </FormField>
          </FormTemplate.Content>

          <FormTemplate.Footer
            onCancel={handleCancel}
            isLoading={isLoading}
            submitLabel={isEdit ? "Salvar" : "Criar"}
          />
        </Form>
      </FormTemplate>
    </div>
  );
}
