import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { cn } from "@/lib/utils";

export interface ListSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  resultLabel?: string;
  resultsCount?: number;
  className?: string;
}

export interface ListActionProps {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
}

export interface ListToolbarProps {
  search: ListSearchBarProps;
  action?: Omit<ListActionProps, "className" | "buttonClassName"> & {
    buttonClassName?: string;
  };
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Buscar...",
  resultLabel = "item",
  resultsCount,
  className,
}: ListSearchBarProps) {
  return (
    <div className={cn("mb-4 space-y-3", className)}>
      <SearchInput
        value={value}
        onChange={onChange}
        onClear={onClear}
        placeholder={placeholder}
      />
      {value && resultsCount !== undefined && resultsCount > 0 && (
        <p className="text-xs text-muted-foreground">
          Encontramos {resultsCount} {resultLabel}
          {resultsCount !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

export function Action({
  label,
  icon: Icon,
  onClick,
  disabled,
  className,
  buttonClassName,
}: ListActionProps) {
  return (
    <div className={cn("flex justify-end", className)}>
      <Button onClick={onClick} disabled={disabled} className={buttonClassName}>
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </div>
  );
}

export function Toolbar({ search, action, className }: ListToolbarProps) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-3 sm:flex-row sm:items-start",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <SearchBar {...search} className="mb-0" />
      </div>
      {action && (
        <Action
          {...action}
          className="w-full shrink-0 sm:w-auto"
          buttonClassName={cn("w-full sm:w-auto", action.buttonClassName)}
        />
      )}
    </div>
  );
}
