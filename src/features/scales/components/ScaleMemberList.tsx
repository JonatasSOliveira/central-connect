"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListItemCard } from "@/components/ui/list-item-card";
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
              <select
                {...form.register(`members.${index}.memberId`)}
                className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring"
              >
                <option value="">Selecione um membro</option>
                {availableMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.fullName}
                  </option>
                ))}
              </select>
              {form.formState.errors.members?.[index]?.memberId && (
                <p className="text-xs text-destructive">
                  {
                    form.formState.errors.members[index]?.memberId
                      ?.message as string
                  }
                </p>
              )}

              <select
                {...form.register(`members.${index}.ministryRoleId`)}
                className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring"
              >
                <option value="">Selecione uma função</option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
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
