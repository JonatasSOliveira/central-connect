"use client";

import { SearchableSelect } from "@/components/ui/searchable-select";
import type { MinistryRoleOption } from "../types";

interface ScaleRolePickerProps {
  roles: MinistryRoleOption[];
  selectedRoleIds: string[];
  isLoading: boolean;
  onAdd: (roleId: string) => void;
}

export function ScaleRolePicker({
  roles,
  selectedRoleIds,
  isLoading,
  onAdd,
}: ScaleRolePickerProps) {
  const options = roles
    .filter((role) => !selectedRoleIds.includes(role.id))
    .map((role) => ({
      value: role.id,
      label: `${role.displayOrder}. ${role.name} · ideal: ${role.requiredCount}`,
    }));

  return (
    <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3">
      <SearchableSelect
        label="Adicionar função"
        value=""
        onChange={onAdd}
        options={options}
        placeholder={isLoading ? "Carregando funções..." : "Selecione uma função"}
        searchPlaceholder="Pesquisar função..."
        emptyText="Todas as funções já foram adicionadas"
        disabled={isLoading || options.length === 0}
      />
      <p className="mt-2 text-xs text-muted-foreground">
        Depois de escolher a função, você verá somente as pessoas autorizadas para ela.
      </p>
    </div>
  );
}
