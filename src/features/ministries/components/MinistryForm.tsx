"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { MinistryFormInput } from "@/application/dtos/ministry/MinistryDTO";
import { PrivateHeader } from "@/components/modules/private-header";
import { FormTemplate } from "@/components/templates/form-template";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useMinistryForm } from "@/features/ministries/hooks/useMinistryForm";

interface MinistryFormProps {
  mode: "create" | "edit";
  ministryId?: string;
  backHref?: string;
}

export function MinistryForm({
  mode,
  ministryId,
  backHref = "/ministries",
}: MinistryFormProps) {
  const router = useRouter();
  const {
    form,
    fields,
    append,
    remove,
    isLoading,
    isFetching,
    onSubmit,
    isEdit,
  } = useMinistryForm({ mode, ministryId });

  const handleCancel = () => {
    router.push(backHref);
  };

  const title = isEdit ? "Editar Ministério" : "Novo Ministério";
  const subtitle = isEdit
    ? "Altere os dados do ministério"
    : "Preencha os dados do ministério";

  const handleAddRole = () => {
    append({ name: "", id: null });
  };

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
        <FormTemplate.Form<MinistryFormInput> form={form} onSubmit={onSubmit}>
          <FormTemplate.Content>
            <FormField<MinistryFormInput>
              form={form}
              name="name"
              label="Nome"
              placeholder="Nome do ministério"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField<MinistryFormInput>
                form={form}
                name="minMembersPerService"
                label="Mín. membros por serviço"
                required
              >
                <Input
                  id="minMembersPerService"
                  type="number"
                  min={0}
                  {...form.register("minMembersPerService")}
                />
              </FormField>

              <FormField<MinistryFormInput>
                form={form}
                name="idealMembersPerService"
                label="Mín. ideal por serviço"
                required
              >
                <Input
                  id="idealMembersPerService"
                  type="number"
                  min={0}
                  {...form.register("idealMembersPerService")}
                />
              </FormField>
            </div>

            <FormField<MinistryFormInput>
              form={form}
              name="notes"
              label="Observações"
              placeholder="Observações opcionais"
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Funções</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddRole}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar função
                </Button>
              </div>

              {fields.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">
                  Nenhuma função adicionada. Clique em "Adicionar função" para
                  incluir.
                </p>
              )}

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-start gap-2 p-3 rounded-lg border border-border/50 bg-card"
                >
                  <div className="flex-1">
                    <Input
                      placeholder="Nome da função"
                      {...form.register(`roles.${index}.name`)}
                    />
                    {form.formState.errors.roles?.[index]?.name && (
                      <p className="text-xs text-destructive mt-1">
                        {
                          form.formState.errors.roles[index]?.name
                            ?.message as string
                        }
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </FormTemplate.Content>

          <FormTemplate.Footer
            onCancel={handleCancel}
            isLoading={isLoading}
            submitLabel={isEdit ? "Salvar" : "Criar"}
          />
        </FormTemplate.Form>
      </FormTemplate>
    </div>
  );
}
