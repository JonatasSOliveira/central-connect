"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import type { MinistryFormInput } from "@/application/dtos/ministry/MinistryDTO";
import { FormTemplate } from "@/components/templates/form-template";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { ListItemCard } from "@/components/ui/list-item-card";
import { MemberSelect } from "@/components/ui/member-select";
import { NumberStepper } from "@/components/ui/number-stepper";
import { useMinistryForm } from "@/features/ministries/hooks/useMinistryForm";

interface MinistryFormProps {
  mode: "create" | "edit";
  ministryId?: string;
}

export function MinistryForm({ mode, ministryId }: MinistryFormProps) {
  const router = useRouter();
  const {
    form,
    editableFields,
    editableAppend,
    editableRemove,
    isLoading,
    isFetching,
    onSubmit,
    memberOptions,
  } = useMinistryForm({ mode, ministryId });

  const handleCancel = () => {
    router.push("/ministries");
  };

  const handleAddRole = () => {
    editableAppend({ name: "", id: null, requiredCount: 1 });
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
      <FormTemplate.Form<MinistryFormInput> form={form} onSubmit={onSubmit}>
        <FormTemplate.Content>
          <FormField<MinistryFormInput>
            form={form}
            name="name"
            label="Nome"
            placeholder="Nome do ministério"
            required
          />

          <MemberSelect
            label="Líder Responsável"
            value={form.watch("leaderId") || ""}
            onChange={(value) => form.setValue("leaderId", value || null)}
            members={memberOptions}
            allOptionLabel="Selecione"
            placeholder="Selecione"
          />

          <FormField<MinistryFormInput>
            form={form}
            name="notes"
            label="Observações"
            placeholder="Observações opcionais"
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Funções</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRole}
                className="h-9"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>

            {editableFields.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center bg-muted/30 rounded-lg">
                Nenhuma função adicionada
              </p>
            )}

            {editableFields.map((field, index) => (
              <ListItemCard
                key={field.id}
                index={index}
                onRemove={() => editableRemove(index)}
              >
                <div className="space-y-3">
                  <Input
                    placeholder="Nome da função"
                    {...form.register(`roles.${index}.name`)}
                  />
                  <NumberStepper
                    label="Qtd. obrigatória"
                    value={Number(form.watch(`roles.${index}.requiredCount`)) || 1}
                    onChange={(value) =>
                      form.setValue(`roles.${index}.requiredCount`, value, {
                        shouldValidate: true,
                      })
                    }
                    min={1}
                    max={20}
                    error={
                      form.formState.errors.roles?.[index]?.requiredCount
                        ?.message as string
                    }
                  />
                </div>
                {form.formState.errors.roles?.[index]?.name && (
                  <p className="text-xs text-destructive">
                    {
                      form.formState.errors.roles[index]?.name
                        ?.message as string
                    }
                  </p>
                )}
              </ListItemCard>
            ))}
          </div>
        </FormTemplate.Content>

        <FormTemplate.Footer
          onCancel={handleCancel}
          isLoading={isLoading}
          submitLabel={mode === "edit" ? "Salvar" : "Criar"}
        />
      </FormTemplate.Form>
    </FormTemplate>
  );
}
