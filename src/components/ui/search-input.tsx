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
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn("pl-10 pr-10", className)}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full hover:bg-muted transition-colors"
          aria-label="Limpar busca"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
