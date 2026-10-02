"use client";

import { ClipboardList } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { UseScaleFormReturn } from "../hooks/useScaleForm";
import { ScaleRoleCard } from "./ScaleRoleCard";
import { ScaleRolePicker } from "./ScaleRolePicker";

interface ScaleRoleListProps {
  form: UseScaleFormReturn["form"];
  ministryId: string;
  editableFields: UseScaleFormReturn["editableFields"];
  editableAppend: UseScaleFormReturn["editableAppend"];
  editableRemove: UseScaleFormReturn["editableRemove"];
  availableMembers: UseScaleFormReturn["availableMembers"];
  availableRoles: UseScaleFormReturn["availableRoles"];
  isLoadingMembers: boolean;
  isLoadingRoles: boolean;
}

export function ScaleRoleList({
  form,
  ministryId,
  editableFields,
  editableAppend,
  editableRemove,
  availableMembers,
  availableRoles,
  isLoadingMembers,
  isLoadingRoles,
}: ScaleRoleListProps) {
  const [activeRoleIds, setActiveRoleIds] = useState<string[]>([]);
  const fieldRoleSignature = editableFields
    .map((field) => field.ministryRoleId)
    .filter(Boolean)
    .join(",");

  useEffect(() => {
    if (ministryId) setActiveRoleIds([]);
    else setActiveRoleIds([]);
  }, [ministryId]);

  useEffect(() => {
    if (!fieldRoleSignature) return;
    const fieldRoleIds = fieldRoleSignature.split(",");
    setActiveRoleIds((current) => {
      const next = Array.from(new Set([...current, ...fieldRoleIds]));
      return next.length === current.length && next.every((id, index) => id === current[index])
        ? current
        : next;
    });
  }, [fieldRoleSignature]);

  const selectedMemberIds = (form.watch("members") ?? [])
    .map((member) => member.memberId)
    .filter(Boolean);
  const roleById = useMemo(
    () => new Map(availableRoles.map((role) => [role.id, role])),
    [availableRoles],
  );

  const handleAddRole = (roleId: string) => {
    setActiveRoleIds((current) => (current.includes(roleId) ? current : [...current, roleId]));
  };

  const handleRemoveRole = (roleId: string) => {
    const indexes = editableFields
      .map((field, index) => (field.ministryRoleId === roleId ? index : -1))
      .filter((index) => index >= 0)
      .reverse();
    indexes.forEach((index) => {
      editableRemove(index);
    });
    setActiveRoleIds((current) => current.filter((id) => id !== roleId));
  };

  return (
    <section className="space-y-4 rounded-xl border border-primary/20 bg-background p-4 sm:p-5" aria-labelledby="scale-roles-title">
      <div>
        <div className="flex items-center gap-2">
          <ClipboardList className="size-5 text-primary" aria-hidden="true" />
          <h2 id="scale-roles-title" className="font-heading text-lg font-bold text-foreground">Funções da escala</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Adicione uma função por vez e escolha as pessoas autorizadas para ela.</p>
      </div>

      {activeRoleIds.length === 0 && (
        <p className="rounded-lg bg-muted/40 px-3 py-3 text-sm text-muted-foreground">Nenhuma função adicionada ainda.</p>
      )}

      <div className="space-y-3">
        {activeRoleIds.map((roleId) => {
          const role = roleById.get(roleId);
          if (!role) return null;
          const selectedMembers = editableFields.flatMap((field, index) =>
            field.ministryRoleId === roleId
              ? [{ index, memberId: form.watch(`members.${index}.memberId`) || "", fieldId: field.id }]
              : [],
          );
          return (
            <ScaleRoleCard
              key={roleId}
              role={role}
              selectedMembers={selectedMembers}
              availableMembers={availableMembers}
              selectedMemberIds={selectedMemberIds}
              onAddMember={(memberId) => editableAppend({ id: null, memberId, ministryRoleId: roleId, notes: "" })}
              onRemoveMember={editableRemove}
              onRemoveRole={() => handleRemoveRole(roleId)}
            />
          );
        })}
      </div>

      <ScaleRolePicker
        roles={availableRoles}
        selectedRoleIds={activeRoleIds}
        isLoading={isLoadingRoles}
        onAdd={handleAddRole}
      />

      {isLoadingMembers && <p className="text-xs text-muted-foreground">Carregando pessoas autorizadas...</p>}
    </section>
  );
}
