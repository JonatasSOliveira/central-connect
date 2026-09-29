"use client";

import { type LucideIcon, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  icon?: LucideIcon;
  placeholder?: string;
  containerClassName?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  icon: Icon = Search,
  placeholder = "Buscar...",
  containerClassName,
  className,
}: SearchInputProps) {
  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  return (
    <div className={cn("relative", containerClassName)}>
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </span>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn("!pl-10 !pr-10", className)}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-2 flex w-11 items-center justify-center rounded-full transition-colors hover:bg-muted md:w-10"
          aria-label="Limpar busca"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
