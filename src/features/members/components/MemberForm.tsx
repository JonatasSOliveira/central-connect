"use client";

import { Eye, Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CreateMemberInput } from "@/application/dtos/member/CreateMemberDTO";
import { PrivateHeader } from "@/components/modules/private-header";
import { Form, FormTemplate } from "@/components/templates/form-template";
import { Button } from "@/components/ui/button";
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
  const {
    form,
    editableFields,
    editableAppend,
    editableRemove,
    isLoading,
    isFetching,
    onSubmit,
    isEdit,
    roles,
    editableChurches,
    readonlyChurches,
    canChangeChurch,
    isSelfEdit,
  } = useMemberForm({
    mode,
    memberId,
  });

  const handleCancel = () => {
    router.push(backHref);
  };

  const getTitle = () => {
    if (isSelfEdit) {
      return "Meu Perfil";
    }
    return isEdit ? "Editar Membro" : "Novo Membro";
  };

  const getSubtitle = () => {
    if (isSelfEdit) {
      return "Altere seus dados pessoais";
    }
    return isEdit ? "Altere os dados do membro" : "Preencha os dados do membro";
  };

  const title = getTitle();
  const subtitle = getSubtitle();

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
              required
            >
              <input
                type="email"
                placeholder="email@exemplo.com"
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:text-sm"
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

            {canChangeChurch && editableChurches.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Igrejas
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs"
                    onClick={() => editableAppend({ churchId: "", roleId: "" })}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Adicionar
                  </Button>
                </div>

                {editableFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-3 border rounded-lg space-y-3 bg-card"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      {editableFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => editableRemove(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <FormField<CreateMemberInput>
                      form={form}
                      name={`churches.${index}.churchId`}
                      label="Igreja"
                      required
                    >
                      <select
                        className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:text-sm"
                        {...form.register(`churches.${index}.churchId`)}
                      >
                        <option value="">Selecione</option>
                        {editableChurches.map((church) => (
                          <option key={church.id} value={church.id}>
                            {church.name}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField<CreateMemberInput>
                      form={form}
                      name={`churches.${index}.roleId`}
                      label="Cargo"
                      required
                    >
                      <select
                        className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:text-sm"
                        {...form.register(`churches.${index}.roleId`)}
                      >
                        <option value="">Selecione</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                ))}

                {readonlyChurches.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Eye className="w-3 h-3" />
                      <span>Outras associações</span>
                    </div>
                    <div className="space-y-2">
                      {readonlyChurches.map((church) => (
                        <div
                          key={church.churchId}
                          className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-md text-xs"
                        >
                          <span className="font-medium truncate flex-1">
                            {church.churchName}
                          </span>
                          <span className="text-muted-foreground truncate max-w-[100px]">
                            {church.roleName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!canChangeChurch && readonlyChurches.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Eye className="w-3 h-3" />
                  <span>Associações</span>
                </div>
                <div className="space-y-2">
                  {readonlyChurches.map((church) => (
                    <div
                      key={church.churchId}
                      className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-md text-xs"
                    >
                      <span className="font-medium truncate flex-1">
                        {church.churchName}
                      </span>
                      <span className="text-muted-foreground truncate max-w-[100px]">
                        {church.roleName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!canChangeChurch && readonlyChurches.length === 0 && (
              <FormField<CreateMemberInput>
                form={form}
                name="churches.0.roleId"
                label="Cargo"
                required
              >
                <select
                  className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:text-sm"
                  {...form.register("churches.0.roleId")}
                >
                  <option value="">Selecione um cargo</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </FormField>
            )}
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
