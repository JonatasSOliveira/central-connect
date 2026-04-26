"use client";

import { useMemo } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";

export interface MinistryRoleSelectItem {
  id: string;
  name: string;
}

interface MinistryRoleSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  roles: MinistryRoleSelectItem[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  required?: boolean;
}

export function MinistryRoleSelect({
  label,
  value,
  onChange,
  roles,
  placeholder = "Selecione uma função",
  searchPlaceholder = "Pesquisar função...",
  emptyText = "Nenhuma função encontrada",
  disabled = false,
  required = false,
}: MinistryRoleSelectProps) {
  const options = useMemo(
    () =>
      [...roles]
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }))
        .map((role) => ({ value: role.id, label: role.name })),
    [roles],
  );

  return (
    <SearchableSelect
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyText={emptyText}
      disabled={disabled}
      required={required}
    />
  );
}
