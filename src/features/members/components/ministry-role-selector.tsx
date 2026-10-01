"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { MinistryListItemDTO } from "@/modules/ministries/presentation/contracts/ministry/MinistryDTO";

interface MinistryRoleSelectorProps {
  ministry: MinistryListItemDTO;
  selectedRoleIds: string[];
  canEdit: boolean;
  onToggleRole: (roleId: string) => void;
  disabled?: boolean;
}

export function MinistryRoleSelector({
  ministry,
  selectedRoleIds,
  canEdit,
  onToggleRole,
  disabled = false,
}: MinistryRoleSelectorProps) {
  if (!canEdit && selectedRoleIds.length === 0) return null;

  if (ministry.roles.length === 0) {
    return (
      <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        Este ministério ainda não possui funções cadastradas.
      </p>
    );
  }

  return (
    <fieldset className="space-y-2 rounded-lg border border-border/70 bg-background/70 p-3">
      <legend className="px-1 text-sm font-medium text-foreground">
        {ministry.name}
      </legend>
      <p className="text-xs text-muted-foreground">
        {canEdit
          ? "Marque somente as funções que esta pessoa está autorizada a exercer."
          : "Funções autorizadas para esta pessoa."}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {ministry.roles.map((role) => {
          const checkboxId = `member-ministry-role-${ministry.id}-${role.id}`;
          const checked = selectedRoleIds.includes(role.id);

          return (
            <label
              key={role.id}
              htmlFor={checkboxId}
              className="flex min-h-11 items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-muted/40 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
            >
              <Checkbox
                id={checkboxId}
                checked={checked}
                disabled={!canEdit || disabled}
                onCheckedChange={() => {
                  if (canEdit && !disabled) onToggleRole(role.id);
                }}
              />
              <span>{role.name}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
