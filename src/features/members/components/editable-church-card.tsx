"use client";

import { Button } from "@/components/ui/button";
import { ChurchSelect } from "@/components/ui/church-select";
import { RoleSelect } from "@/components/ui/role-select";
import type { ChurchListItemDTO } from "@/modules/churches/presentation/contracts/church/ChurchDTO";
import type { MinistryListItemDTO } from "@/modules/ministries/presentation/contracts/ministry/MinistryDTO";
import type { RoleListItem } from "@/modules/roles/presentation/contracts/role/ListRolesDTO";
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
  canChangeChurch: boolean;
  canEditSystemRole: boolean;
  canEditMinistries: boolean;
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
  canChangeChurch,
  canEditSystemRole,
  canEditMinistries,
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
  const churchName =
    editableChurches.find((church) => church.id === churchId)?.name || "Igreja";

  const handleChurchChange = (value: string) => {
    onChurchChange(value);
    onMinistryChange("");
    if (value) {
      onFetchMinistries(value);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-border/80 bg-card/70 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Igreja {index + 1}
        </span>
        {canRemove && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="min-h-11 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Remover
          </Button>
        )}
      </div>

      {canChangeChurch ? (
        <ChurchSelect
          label="Igreja"
          value={churchId || ""}
          onChange={handleChurchChange}
          churches={editableChurches}
          placeholder="Selecione uma igreja"
          required
          disabled={disabled}
        />
      ) : (
        <div className="space-y-1">
          <span className="text-sm font-medium text-foreground">Igreja</span>
          <div className="min-h-11 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
            {churchName}
          </div>
        </div>
      )}

      {canEditSystemRole && (
        <RoleSelect
          label="Cargo"
          value={roleId || ""}
          onChange={onRoleChange}
          roles={roles}
          placeholder="Selecione um cargo"
          required
          disabled={disabled}
        />
      )}

      {churchId && canEditMinistries && (
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
