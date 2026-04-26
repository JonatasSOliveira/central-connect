"use client";

import { useMemo } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";

export interface RoleSelectItem {
  id: string;
  name: string;
}

interface RoleSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  roles: RoleSelectItem[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  required?: boolean;
  allOptionLabel?: string;
}

export function RoleSelect({
  label,
  value,
  onChange,
  roles,
  placeholder = "Selecione um cargo",
  searchPlaceholder = "Pesquisar cargo...",
  emptyText = "Nenhum cargo encontrado",
  disabled = false,
  required = false,
  allOptionLabel,
}: RoleSelectProps) {
  const options = useMemo(() => {
    const normalized = [...roles]
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }))
      .map((role) => ({ value: role.id, label: role.name }));

    if (!allOptionLabel) {
      return normalized;
    }

    return [{ value: "", label: allOptionLabel }, ...normalized];
  }, [allOptionLabel, roles]);

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
