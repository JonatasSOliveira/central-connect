"use client";

import { useMemo } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";

export interface ServiceSelectItem {
  id: string;
  title: string;
  date: string | Date;
  time: string;
}

interface ServiceSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  services: ServiceSelectItem[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  required?: boolean;
  fromToday?: boolean;
  allOptionLabel?: string;
}

export function ServiceSelect({
  label,
  value,
  onChange,
  services,
  placeholder = "Selecione um culto",
  searchPlaceholder = "Pesquisar culto...",
  emptyText = "Nenhum culto encontrado",
  disabled = false,
  required = false,
  fromToday = false,
  allOptionLabel,
}: ServiceSelectProps) {
  const options = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);

    const normalized = services
      .filter((service) => {
        const serviceDate = new Date(service.date);
        if (Number.isNaN(serviceDate.getTime())) {
          return false;
        }

        if (!fromToday) {
          return true;
        }

        return serviceDate.toISOString().slice(0, 10) >= todayKey;
      })
      .sort((a, b) => {
        const aDateTime = `${new Date(a.date).toISOString().slice(0, 10)}T${a.time || "00:00"}`;
        const bDateTime = `${new Date(b.date).toISOString().slice(0, 10)}T${b.time || "00:00"}`;
        return aDateTime.localeCompare(bDateTime);
      })
      .map((service) => {
        const date = new Date(service.date);
        const formattedDate = date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone: "UTC",
        });

        return {
          value: service.id,
          label: service.title,
          description: `${formattedDate} às ${service.time}`,
        };
      });

    if (!allOptionLabel) {
      return normalized;
    }

    return [{ value: "", label: allOptionLabel }, ...normalized];
  }, [allOptionLabel, fromToday, services]);

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
