"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CreateMemberInput } from "@/application/dtos/member/CreateMemberDTO";
import { PrivateHeader } from "@/components/modules/private-header";
import { Form, FormTemplate } from "@/components/templates/form-template";
import { FormField } from "@/components/ui/form-field";
import { useMemberForm } from "@/features/members/hooks/useMemberForm";

interface MemberFormProps {
  mode: "create" | "edit";
  memberId?: string;
  backHref?: string;
}

export function MemberForm({
  mode,
  memberId,
  backHref = "/members",
}: MemberFormProps) {
  const router = useRouter();
  const { form, isLoading, isFetching, onSubmit, isEdit, roles } =
    useMemberForm({
      mode,
      memberId,
    });

  const handleCancel = () => {
    router.push(backHref);
  };

  const title = isEdit ? "Editar Membro" : "Novo Membro";
  const subtitle = isEdit
    ? "Altere os dados do membro"
    : "Preencha os dados do membro";

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
        <Form<CreateMemberInput> form={form} onSubmit={onSubmit}>
          <FormTemplate.Content>
            <FormField<CreateMemberInput>
              form={form}
              name="email"
              label="Email"
              placeholder="email@exemplo.com"
              required
            >
              <input
                type="email"
                placeholder="email@exemplo.com"
                className="w-full px-3 py-2 border rounded-md"
                {...form.register("email")}
              />
            </FormField>

            <FormField<CreateMemberInput>
              form={form}
              name="fullName"
              label="Nome completo"
              placeholder="Nome do membro"
              required
            />

            <FormField<CreateMemberInput>
              form={form}
              name="phone"
              label="Telefone"
              placeholder="(00) 00000-0000"
            />

            <FormField<CreateMemberInput>
              form={form}
              name="churchId"
              label="Igreja"
              required
            >
              <input
                type="text"
                placeholder="ID da igreja"
                className="w-full px-3 py-2 border rounded-md"
                {...form.register("churchId")}
              />
            </FormField>

            <FormField<CreateMemberInput>
              form={form}
              name="roleId"
              label="Cargo"
              required
            >
              <select
                className="w-full px-3 py-2 border rounded-md"
                {...form.register("roleId")}
              >
                <option value="">Selecione um cargo</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
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
