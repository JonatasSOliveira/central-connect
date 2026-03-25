"use client";

import { Plus } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { ChurchListItemDTO } from "@/application/dtos/church/ChurchDTO";
import type { CreateMemberInput } from "@/application/dtos/member/CreateMemberDTO";
import type { MinistryListItemDTO } from "@/application/dtos/ministry/MinistryDTO";
import type { RoleListItem } from "@/application/dtos/role/ListRolesDTO";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
import type {
  ReadonlyChurch,
  UseMemberFormReturn,
} from "@/features/members/hooks/useMemberForm";
import { EditableChurchCard } from "./editable-church-card";
import { ReadonlyChurchList } from "./readonly-church-list";

interface ChurchSectionProps {
  form: UseFormReturn<CreateMemberInput>;
  editableFields: UseMemberFormReturn["editableFields"];
  editableChurches: ChurchListItemDTO[];
  roles: RoleListItem[];
  readonlyChurches: ReadonlyChurch[];
  canChangeChurch: boolean;
  getMinistriesByChurch: (churchId: string) => MinistryListItemDTO[];
  fetchMinistriesByChurch: (churchId: string) => Promise<void>;
  isLoadingMinistries: boolean;
  editableAppendMinistry: (churchIndex: number, ministryId: string) => void;
  editableRemoveMinistry: (churchIndex: number, ministryIndex: number) => void;
  editableAppend: (data: {
    churchId: string;
    roleId: string;
    ministryIds: string[];
  }) => void;
  editableRemove: (index: number) => void;
}

export function ChurchSection({
  form,
  editableFields,
  editableChurches,
  roles,
  readonlyChurches,
  canChangeChurch,
  getMinistriesByChurch,
  fetchMinistriesByChurch,
  isLoadingMinistries,
  editableAppendMinistry,
  editableRemoveMinistry,
  editableAppend,
  editableRemove,
}: ChurchSectionProps) {
  if (!canChangeChurch) {
    if (readonlyChurches.length > 0) {
      return <ReadonlyChurchList churches={readonlyChurches} />;
    }

    return (
      <FormSelect
        label="Cargo do sistema"
        value={form.watch("churches.0.roleId") || ""}
        onChange={(value) =>
          form.setValue("churches.0.roleId", value, {
            shouldValidate: true,
          })
        }
        options={roles.map((role) => ({
          value: role.id,
          label: role.name,
        }))}
        placeholder="Selecione um cargo do sistema"
        required
      />
    );
  }

  if (editableChurches.length === 0) {
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
          Igrejas
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9"
          onClick={handleAppend}
        >
          <Plus className="w-4 h-4 mr-1" />
          Adicionar
        </Button>
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
              canRemove={editableFields.length > 1}
              onChurchChange={(value) =>
                form.setValue(`churches.${index}.churchId`, value, {
                  shouldValidate: true,
                })
              }
              onRoleChange={(value) =>
                form.setValue(`churches.${index}.roleId`, value, {
                  shouldValidate: true,
                })
              }
              onMinistryChange={(value) =>
                form.setValue(`churches.${index}.ministryIds`, [])
              }
              onFetchMinistries={fetchMinistriesByChurch}
              onAddMinistry={(ministryId) =>
                editableAppendMinistry(index, ministryId)
              }
              onRemoveMinistry={(ministryIndex) =>
                editableRemoveMinistry(index, ministryIndex)
              }
              onRemove={() => editableRemove(index)}
            />
          );
        })}
      </div>

      {readonlyChurches.length > 0 && (
        <ReadonlyChurchList
          churches={readonlyChurches}
          title="Outras associações"
        />
      )}
    </div>
  );
}
