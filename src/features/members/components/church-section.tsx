"use client";

import { Plus } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { RoleSelect } from "@/components/ui/role-select";
import type {
  ReadonlyChurch,
  UseMemberFormReturn,
} from "@/features/members/hooks/useMemberForm";
import type { ChurchListItemDTO } from "@/modules/churches/presentation/contracts/church/ChurchDTO";
import type { CreateMemberInput } from "@/modules/members/presentation/contracts/member/CreateMemberDTO";
import type { MinistryListItemDTO } from "@/modules/ministries/presentation/contracts/ministry/MinistryDTO";
import type { RoleListItem } from "@/modules/roles/presentation/contracts/role/ListRolesDTO";
import { EditableChurchCard } from "./editable-church-card";
import { ReadonlyChurchList } from "./readonly-church-list";

interface ChurchSectionProps {
  form: UseFormReturn<CreateMemberInput>;
  editableFields: UseMemberFormReturn["editableFields"];
  editableChurches: ChurchListItemDTO[];
  roles: RoleListItem[];
  readonlyChurches: ReadonlyChurch[];
  canChangeChurch: boolean;
  canEditSystemRole: boolean;
  canEditMinistries: boolean;
  canEditMinistryRoles: boolean;
  getMinistriesByChurch: (churchId: string) => MinistryListItemDTO[];
  fetchMinistriesByChurch: (churchId: string) => Promise<void>;
  isLoadingMinistries: boolean;
  editableAppendMinistry: (churchIndex: number, ministryId: string) => void;
  editableRemoveMinistry: (churchIndex: number, ministryIndex: number) => void;
  getMinistryRoleIds: (churchId: string, ministryId: string) => string[];
  onToggleMinistryRole: (
    churchId: string,
    ministryId: string,
    roleId: string,
  ) => void;
  clearChurchMinistryAssignments: (churchId: string) => void;
  editableAppend: (data: {
    churchId: string;
    roleId: string;
    ministryIds: string[];
  }) => void;
  editableRemove: (index: number) => void;
  disabled?: boolean;
}

export function ChurchSection({
  form,
  editableFields,
  editableChurches,
  roles,
  readonlyChurches,
  canChangeChurch,
  canEditSystemRole,
  canEditMinistries,
  canEditMinistryRoles,
  getMinistriesByChurch,
  fetchMinistriesByChurch,
  isLoadingMinistries,
  editableAppendMinistry,
  editableRemoveMinistry,
  getMinistryRoleIds,
  onToggleMinistryRole,
  clearChurchMinistryAssignments,
  editableAppend,
  editableRemove,
  disabled = false,
}: ChurchSectionProps) {
  form.watch("ministryRoleAssignments");

  if (disabled) {
    if (readonlyChurches.length > 0) {
      return <ReadonlyChurchList churches={readonlyChurches} />;
    }

    return (
      <RoleSelect
        label="Cargo"
        value={form.watch("churches.0.roleId") || ""}
        onChange={(value) =>
          form.setValue("churches.0.roleId", value, {
            shouldValidate: true,
          })
        }
        roles={roles}
        placeholder="Selecione um cargo"
        required
        disabled={disabled}
      />
    );
  }

  if (!canChangeChurch && !canEditMinistries) {
    if (readonlyChurches.length > 0) {
      return <ReadonlyChurchList churches={readonlyChurches} />;
    }

    return null;
  }

  if (editableChurches.length === 0 && canChangeChurch) {
    return null;
  }

  const handleAppend = () => {
    editableAppend({
      churchId: "",
      roleId: "",
      ministryIds: [],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Igrejas associadas
        </span>
      </div>

      <div className="space-y-3">
        {editableFields.map((field, index) => {
          const churchId = form.watch(`churches.${index}.churchId`) || "";
          const roleId = form.watch(`churches.${index}.roleId`) || "";
          const ministryIds = form.watch(`churches.${index}.ministryIds`) || [];
          const availableMinistries = getMinistriesByChurch(churchId);

          return (
            <EditableChurchCard
              key={field.id}
              index={index}
              churchId={churchId}
              roleId={roleId}
              selectedMinistryIds={ministryIds}
              editableChurches={editableChurches}
              roles={roles}
              availableMinistries={availableMinistries}
              isLoadingMinistries={isLoadingMinistries}
              canChangeChurch={canChangeChurch}
              canEditSystemRole={canEditSystemRole}
              canEditMinistries={canEditMinistries}
              canEditMinistryRoles={canEditMinistryRoles}
              canRemove={canChangeChurch && editableFields.length > 1}
              onChurchChange={(value) => {
                clearChurchMinistryAssignments(churchId);
                form.setValue(`churches.${index}.churchId`, value, {
                  shouldValidate: true,
                });
              }}
              onRoleChange={(value) =>
                form.setValue(`churches.${index}.roleId`, value, {
                  shouldValidate: true,
                })
              }
              onMinistryChange={(_value) =>
                form.setValue(`churches.${index}.ministryIds`, [])
              }
              onFetchMinistries={fetchMinistriesByChurch}
              onAddMinistry={(ministryId) =>
                editableAppendMinistry(index, ministryId)
              }
              onRemoveMinistry={(ministryIndex) =>
                editableRemoveMinistry(index, ministryIndex)
              }
              getMinistryRoleIds={getMinistryRoleIds}
              onToggleMinistryRole={onToggleMinistryRole}
              onRemove={() => editableRemove(index)}
            />
          );
        })}
      </div>

      {canChangeChurch && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11 w-full sm:w-auto"
          onClick={handleAppend}
          disabled={disabled}
        >
          <Plus className="mr-1 h-4 w-4" />
          Adicionar outra igreja
        </Button>
      )}

      {readonlyChurches.length > 0 && (
        <ReadonlyChurchList
          churches={readonlyChurches}
          title="Outras associações"
        />
      )}
    </div>
  );
}
