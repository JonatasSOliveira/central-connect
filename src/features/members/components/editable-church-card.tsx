"use client";

import type { ChurchListItemDTO } from "@/application/dtos/church/ChurchDTO";
import type { MinistryListItemDTO } from "@/application/dtos/ministry/MinistryDTO";
import type { RoleListItem } from "@/application/dtos/role/ListRolesDTO";
import { Button } from "@/components/ui/button";
import { ChurchSelect } from "@/components/ui/church-select";
import { RoleSelect } from "@/components/ui/role-select";
import { MinistrySelector } from "./ministry-selector";

interface EditableChurchCardProps {
  index: number;
  churchId: string;
  roleId: string;
  selectedMinistryIds: string[];
  editableChurches: ChurchListItemDTO[];
  roles: RoleListItem[];
  availableMinistries: MinistryListItemDTO[];
  isLoadingMinistries: boolean;
  canRemove: boolean;
  onChurchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onMinistryChange: (value: string) => void;
  onFetchMinistries: (churchId: string) => void;
  onAddMinistry: (ministryId: string) => void;
  onRemoveMinistry: (index: number) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function EditableChurchCard({
  index,
  churchId,
  roleId,
  selectedMinistryIds,
  editableChurches,
  roles,
  availableMinistries,
  isLoadingMinistries,
  canRemove,
  onChurchChange,
  onRoleChange,
  onMinistryChange,
  onFetchMinistries,
  onAddMinistry,
  onRemoveMinistry,
  onRemove,
  disabled = false,
}: EditableChurchCardProps) {
  const handleChurchChange = (value: string) => {
    onChurchChange(value);
    onMinistryChange("");
    if (value) {
      onFetchMinistries(value);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          #{index + 1}
        </span>
        {canRemove && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Remover
          </Button>
        )}
      </div>

      <ChurchSelect
        label="Igreja"
        value={churchId || ""}
        onChange={handleChurchChange}
        churches={editableChurches}
        placeholder="Selecione"
        required
        disabled={disabled}
      />

      <RoleSelect
        label="Cargo do sistema"
        value={roleId || ""}
        onChange={onRoleChange}
        roles={roles}
        placeholder="Selecione"
        required
        disabled={disabled}
      />

      {churchId && (
        <MinistrySelector
          churchId={churchId}
          selectedMinistryIds={selectedMinistryIds}
          availableMinistries={availableMinistries}
          isLoading={isLoadingMinistries}
          onAddMinistry={onAddMinistry}
          onRemoveMinistry={onRemoveMinistry}
          disabled={disabled}
        />
      )}
    </div>
  );
}
