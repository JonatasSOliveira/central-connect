"use client";

import { useMemo } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";

export interface MemberSelectItem {
  id: string;
  fullName: string;
}

interface MemberSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  members: MemberSelectItem[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  required?: boolean;
  allOptionLabel?: string;
}

export function MemberSelect({
  label,
  value,
  onChange,
  members,
  placeholder = "Selecione um membro",
  searchPlaceholder = "Pesquisar membro...",
  emptyText = "Nenhum membro encontrado",
  disabled = false,
  required = false,
  allOptionLabel,
}: MemberSelectProps) {
  const options = useMemo(() => {
    const normalized = [...members]
      .sort((a, b) =>
        a.fullName.localeCompare(b.fullName, "pt-BR", { sensitivity: "base" }),
      )
      .map((member) => ({ value: member.id, label: member.fullName }));

    if (!allOptionLabel) {
      return normalized;
    }

    return [{ value: "", label: allOptionLabel }, ...normalized];
  }, [allOptionLabel, members]);

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
