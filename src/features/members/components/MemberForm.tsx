"use client";

import { Eye, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CreateMemberInput } from "@/application/dtos/member/CreateMemberDTO";
import { FormTemplate } from "@/components/templates/form-template";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { ListItemCard } from "@/components/ui/list-item-card";
import { useMemberForm } from "@/features/members/hooks/useMemberForm";

interface MemberFormProps {
  mode: "create" | "edit";
  memberId?: string;
  isSelfEdit?: boolean;
}

export function MemberForm({
  mode,
  memberId,
  isSelfEdit = false,
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
  } = useMemberForm({
    mode,
    memberId,
  });

  const handleCancel = () => {
    router.push("/members");
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <FormTemplate>
      <FormTemplate.Form<CreateMemberInput> form={form} onSubmit={onSubmit}>
        <FormTemplate.Content>
          <FormField<CreateMemberInput> form={form} name="email" label="Email">
            <input
              type="email"
              placeholder="email@exemplo.com"
              className="flex h-12 w-full rounded-lg border border-border bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="h-9"
                  onClick={() => editableAppend({ churchId: "", roleId: "" })}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              {editableFields.map((field, index) => (
                <ListItemCard
                  key={field.id}
                  index={index}
                  canRemove={editableFields.length > 1}
                  onRemove={() => editableRemove(index)}
                >
                  <div className="space-y-3">
                    <FormSelect
                      label="Igreja"
                      value={form.watch(`churches.${index}.churchId`) || ""}
                      onChange={(value) =>
                        form.setValue(`churches.${index}.churchId`, value, {
                          shouldValidate: true,
                        })
                      }
                      options={editableChurches.map((church) => ({
                        value: church.id,
                        label: church.name,
                      }))}
                      placeholder="Selecione"
                      required
                    />

                    <FormSelect
                      label="Cargo do sistema"
                      value={form.watch(`churches.${index}.roleId`) || ""}
                      onChange={(value) =>
                        form.setValue(`churches.${index}.roleId`, value, {
                          shouldValidate: true,
                        })
                      }
                      options={roles.map((role) => ({
                        value: role.id,
                        label: role.name,
                      }))}
                      placeholder="Selecione"
                      required
                    />
                  </div>
                </ListItemCard>
              ))}

              {readonlyChurches.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    <span>Outras associações</span>
                  </div>
                  {readonlyChurches.map((church) => (
                    <div
                      key={church.churchId}
                      className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg text-xs"
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
              )}
            </div>
          )}

          {!canChangeChurch && readonlyChurches.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Eye className="w-3 h-3" />
                <span>Associações</span>
              </div>
              {readonlyChurches.map((church) => (
                <div
                  key={church.churchId}
                  className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg text-xs"
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
          )}

          {!canChangeChurch && readonlyChurches.length === 0 && (
            <FormSelect
              label="Cargo do sistema"
              value={form.watch("churches.0.roleId") || ""}
              onChange={(value) =>
                form.setValue("churches.0.roleId", value, {
                  shouldValidate: true,
                })
              }
              options={roles.map((role) => ({
                value: role.id,
                label: role.name,
              }))}
              placeholder="Selecione um cargo do sistema"
              required
            />
          )}
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
