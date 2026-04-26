"use client";

import { useMemo } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";

export interface ChurchSelectItem {
  id: string;
  name: string;
}

interface ChurchSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  churches: ChurchSelectItem[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  required?: boolean;
  allOptionLabel?: string;
}

export function ChurchSelect({
  label,
  value,
  onChange,
  churches,
  placeholder = "Selecione uma igreja",
  searchPlaceholder = "Pesquisar igreja...",
  emptyText = "Nenhuma igreja encontrada",
  disabled = false,
  required = false,
  allOptionLabel,
}: ChurchSelectProps) {
  const options = useMemo(() => {
    const normalized = [...churches]
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }))
      .map((church) => ({ value: church.id, label: church.name }));

    if (!allOptionLabel) {
      return normalized;
    }

    return [{ value: "", label: allOptionLabel }, ...normalized];
  }, [allOptionLabel, churches]);

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
