"use client";

import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Chip } from "@/components/ui/chip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface MultiSelectProps {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  maxVisibleChips?: number;
}

export function MultiSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Selecione",
  searchPlaceholder = "Pesquisar...",
  emptyText = "Nenhuma opcao encontrada",
  disabled = false,
  maxVisibleChips = 2,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const selectedSet = useMemo(() => new Set(value), [value]);
  const selectedOptions = options.filter((option) => selectedSet.has(option.value));

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;

    return options.filter((option) =>
      `${option.label} ${option.description ?? ""}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [options, query]);

  const handleToggle = (nextValue: string) => {
    onChange(
      selectedSet.has(nextValue)
        ? value.filter((item) => item !== nextValue)
        : [...value, nextValue],
    );
  };

  useEffect(() => {
    if (!open) return;

    const timeoutId = window.setTimeout(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [open]);

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-base",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          )}
          disabled={disabled}
        >
          <span className="flex min-w-0 flex-1 flex-wrap gap-1.5 text-left">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {selectedOptions.slice(0, maxVisibleChips).map((option) => (
                  <Chip key={option.value} variant="muted" className="max-w-full">
                    {option.label}
                  </Chip>
                ))}
                {selectedOptions.length > maxVisibleChips && (
                  <Chip variant="muted">
                    +{selectedOptions.length - maxVisibleChips}
                  </Chip>
                )}
              </>
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

          {value.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mb-2 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent"
            >
              <X className="h-4 w-4" />
              Limpar selecao
            </button>
          )}

          <div className="max-h-56 space-y-1 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <p className="px-2 py-2 text-sm text-muted-foreground">{emptyText}</p>
            ) : (
              filteredOptions.map((option) => {
                const selected = selectedSet.has(option.value);
                return (
                  <label
                    key={option.value}
                    className={cn(
                      "flex w-full cursor-pointer items-start gap-2 rounded-lg border border-border px-3 py-2 text-left",
                      "hover:bg-accent transition-colors",
                      selected && "border-primary/40 bg-primary/5",
                    )}
                  >
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => handleToggle(option.value)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium leading-tight">
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="mt-1 block text-xs leading-tight text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </span>
                    {selected && <Check className="h-4 w-4 text-primary" />}
                  </label>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
