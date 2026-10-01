"use client";

import { Plus } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListItemCard } from "@/components/ui/list-item-card";
import { NumberStepper } from "@/components/ui/number-stepper";
import type { UseMinistryFormReturn } from "@/features/ministries/hooks/useMinistryForm";

interface MinistryRolesEditorProps {
  form: UseMinistryFormReturn["form"];
  fields: UseMinistryFormReturn["editableFields"];
  append: UseMinistryFormReturn["editableAppend"];
  remove: UseMinistryFormReturn["editableRemove"];
}

export function MinistryRolesEditor({
  form,
  fields,
  append,
  remove,
}: MinistryRolesEditorProps) {
  const pendingFocusIndex = useRef<number | null>(null);

  useEffect(() => {
    if (pendingFocusIndex.current === null) return;

    const index = pendingFocusIndex.current;
    const field = fields[index];
    if (!field) return;

    pendingFocusIndex.current = null;
    const input = document.getElementById(`ministry-role-${field.id}-name`);
    input?.focus();
    input?.scrollIntoView({ block: "nearest" });
  }, [fields]);

  const handleAdd = () => {
    pendingFocusIndex.current = fields.length;
    append({ name: "", id: null, requiredCount: 1 });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Você também pode cadastrar as funções depois.
      </p>

      {fields.length === 0 ? (
        <p className="rounded-lg bg-muted/30 px-4 py-5 text-center text-sm text-muted-foreground">
          Nenhuma função adicionada ainda. Adicione uma função para informar
          quantas pessoas serão necessárias.
        </p>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <ListItemCard
              key={field.id}
              index={index}
              onRemove={() => remove(index)}
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor={`ministry-role-${field.id}-name`}
                    className="text-sm font-medium text-foreground"
                  >
                    Nome da função
                  </label>
                  <Input
                    id={`ministry-role-${field.id}-name`}
                    placeholder="Ex.: Vocalista"
                    {...form.register(`roles.${index}.name`)}
                    aria-invalid={Boolean(
                      form.formState.errors.roles?.[index]?.name,
                    )}
                  />
                </div>
                <NumberStepper
                  label="Quantidade necessária"
                  value={
                    Number(form.watch(`roles.${index}.requiredCount`)) || 1
                  }
                  onChange={(value) =>
                    form.setValue(`roles.${index}.requiredCount`, value, {
                      shouldDirty: true,
                      shouldTouch: true,
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
                {form.formState.errors.roles?.[index]?.name && (
                  <p className="text-xs text-destructive">
                    {
                      form.formState.errors.roles[index]?.name
                        ?.message as string
                    }
                  </p>
                )}
              </div>
            </ListItemCard>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full sm:w-auto"
          onClick={handleAdd}
        >
          <Plus className="mr-2 size-4" aria-hidden="true" />
          Adicionar função
        </Button>
      </div>
    </div>
  );
}
