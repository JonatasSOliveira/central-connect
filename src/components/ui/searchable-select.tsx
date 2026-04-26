"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SearchableSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SearchableSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  required?: boolean;
}

export function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Selecione",
  searchPlaceholder = "Pesquisar...",
  emptyText = "Nenhuma opção encontrada",
  disabled = false,
  required = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => {
      const searchable = `${option.label} ${option.description ?? ""}`.toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [options, query]);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
    setQuery("");
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [open]);

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "flex min-h-12 w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-base",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          )}
          disabled={disabled}
        >
          <span className={cn("text-left", !selectedOption && "text-muted-foreground")}>
            {selectedOption ? (
              <span className="block">
                <span className="block text-sm font-medium leading-tight">{selectedOption.label}</span>
                {selectedOption.description && (
                  <span className="block text-xs text-muted-foreground leading-tight mt-0.5">
                    {selectedOption.description}
                  </span>
                )}
              </span>
            ) : (
              placeholder
            )}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>

        <PopoverContent className="w-[calc(100vw-2rem)] p-2 sm:w-[460px]" align="start">
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchInputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1">
            {filteredOptions.length === 0 ? (
              <p className="px-2 py-2 text-sm text-muted-foreground">{emptyText}</p>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "flex w-full items-start justify-between rounded-lg border border-border px-3 py-2 text-left",
                    "hover:bg-accent transition-colors",
                    value === option.value && "border-primary/40 bg-primary/5",
                  )}
                >
                  <span className="pr-3">
                    <span className="block text-sm font-medium leading-tight">{option.label}</span>
                    {option.description && (
                      <span className="block mt-1 text-xs text-muted-foreground leading-tight">
                        {option.description}
                      </span>
                    )}
                  </span>
                  {value === option.value && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
