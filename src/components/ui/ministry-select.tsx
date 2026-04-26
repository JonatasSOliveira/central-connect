"use client";

import { useMemo } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";

export interface MinistrySelectItem {
  id: string;
  name: string;
}

interface MinistrySelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  ministries: MinistrySelectItem[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  required?: boolean;
  allOptionLabel?: string;
}

export function MinistrySelect({
  label,
  value,
  onChange,
  ministries,
  placeholder = "Selecione um ministério",
  searchPlaceholder = "Pesquisar ministério...",
  emptyText = "Nenhum ministério encontrado",
  disabled = false,
  required = false,
  allOptionLabel,
}: MinistrySelectProps) {
  const options = useMemo(() => {
    const normalized = ministries
      .map((ministry) => ({ value: ministry.id, label: ministry.name }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" }),
      );

    if (!allOptionLabel) {
      return normalized;
    }

    return [{ value: "", label: allOptionLabel }, ...normalized];
  }, [allOptionLabel, ministries]);

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
