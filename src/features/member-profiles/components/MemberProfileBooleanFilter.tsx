"use client";

import { SearchableSelect } from "@/components/ui/searchable-select";

interface MemberProfileBooleanFilterProps {
  label: string;
  value: boolean | undefined;
  onChange: (value: boolean | undefined) => void;
}

function booleanToSelect(value: boolean | undefined): string {
  if (value === true) return "true";
  if (value === false) return "false";
  return "";
}

function selectToBoolean(value: string): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export function MemberProfileBooleanFilter({
  label,
  value,
  onChange,
}: MemberProfileBooleanFilterProps) {
  return (
    <SearchableSelect
      label={label}
      value={booleanToSelect(value)}
      onChange={(nextValue) => onChange(selectToBoolean(nextValue))}
      options={[
        { value: "", label: "Todos" },
        { value: "true", label: "Sim" },
        { value: "false", label: "Nao" },
      ]}
    />
  );
}
