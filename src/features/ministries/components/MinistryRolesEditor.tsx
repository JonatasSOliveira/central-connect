"use client";

import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  move: UseMinistryFormReturn["editableMove"];
}

export function MinistryRolesEditor({
  form,
  fields,
  append,
  remove,
  move,
}: MinistryRolesEditorProps) {
  const pendingFocusIndex = useRef<number | null>(null);
  const [announcement, setAnnouncement] = useState("");

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

  const handleMove = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    const field = fields[index];
    if (!field || nextIndex < 0 || nextIndex >= fields.length) return;

    pendingFocusIndex.current = nextIndex;
    move(index, nextIndex);
    setAnnouncement(
      `${form.getValues(`roles.${index}.name`) || "Função"} movida para a posição ${nextIndex + 1}.`,
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Você também pode cadastrar as funções depois.
      </p>
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
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
              actions={
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    onClick={() => handleMove(index, -1)}
                    disabled={index === 0}
                    aria-label={`Mover ${form.watch(`roles.${index}.name`) || "função"} para cima`}
                    title="Mover para cima"
                  >
                    <ArrowUp className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    onClick={() => handleMove(index, 1)}
                    disabled={index === fields.length - 1}
                    aria-label={`Mover ${form.watch(`roles.${index}.name`) || "função"} para baixo`}
                    title="Mover para baixo"
                  >
                    <ArrowDown className="size-4" aria-hidden="true" />
                  </Button>
                </>
              }
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
