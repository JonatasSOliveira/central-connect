"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListItemCard } from "@/components/ui/list-item-card";
import { MemberSelect } from "@/components/ui/member-select";
import { MinistryRoleSelect } from "@/components/ui/ministry-role-select";
import type { UseScaleFormReturn } from "../hooks/useScaleForm";

interface ScaleMemberListProps {
  form: UseScaleFormReturn["form"];
  editableFields: UseScaleFormReturn["editableFields"];
  editableRemove: UseScaleFormReturn["editableRemove"];
  onAddMember: () => void;
  availableMembers: UseScaleFormReturn["availableMembers"];
  availableRoles: UseScaleFormReturn["availableRoles"];
  isLoadingMembers: boolean;
  isLoadingRoles: boolean;
}

export function ScaleMemberList({
  form,
  editableFields,
  editableRemove,
  onAddMember,
  availableMembers,
  availableRoles,
  isLoadingMembers,
  isLoadingRoles,
}: ScaleMemberListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Membros</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddMember}
          className="h-9"
          disabled={!form.watch("ministryId")}
        >
          <Plus className="w-4 h-4 mr-1" />
          Adicionar
        </Button>
      </div>

      {isLoadingMembers || isLoadingRoles ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : editableFields.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center bg-muted/30 rounded-lg">
          Nenhum membro adicionado
        </p>
      ) : (
        editableFields.map((field, index) => (
          <ListItemCard
            key={field.id}
            index={index}
            onRemove={() => editableRemove(index)}
          >
            <div className="space-y-3">
              <MemberSelect
                label="Membro"
                value={form.watch(`members.${index}.memberId`) || ""}
                onChange={(value) =>
                  form.setValue(`members.${index}.memberId`, value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                members={availableMembers}
                placeholder="Selecione um membro"
                required
              />
              {form.formState.errors.members?.[index]?.memberId && (
                <p className="text-xs text-destructive">
                  {
                    form.formState.errors.members[index]?.memberId
                      ?.message as string
                  }
                </p>
              )}

              <MinistryRoleSelect
                label="Função"
                value={form.watch(`members.${index}.ministryRoleId`) || ""}
                onChange={(value) =>
                  form.setValue(`members.${index}.ministryRoleId`, value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                roles={availableRoles}
                placeholder="Selecione uma função"
                required
              />
              {form.formState.errors.members?.[index]?.ministryRoleId && (
                <p className="text-xs text-destructive">
                  {
                    form.formState.errors.members[index]?.ministryRoleId
                      ?.message as string
                  }
                </p>
              )}
            </div>
          </ListItemCard>
        ))
      )}
    </div>
  );
}
