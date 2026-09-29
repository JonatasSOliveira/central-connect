"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NumberStepperProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function NumberStepper({
  id,
  value,
  onChange,
  min = 0,
  max = 99,
  label,
  error,
  disabled = false,
  className,
}: NumberStepperProps) {
  const labelId = id ? `${id}-label` : undefined;

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <fieldset aria-labelledby={labelId} className="space-y-2">
        {label && (
          <legend id={labelId} className="text-sm font-medium text-foreground">
            {label}
          </legend>
        )}
        <div
          className={cn(
            "flex items-center justify-center rounded-lg border border-border bg-card",
            error && "border-destructive",
            disabled && "opacity-50",
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDecrement}
            disabled={disabled || value <= min}
            className="h-12 w-12 rounded-none border-r border-border hover:bg-muted/50"
            aria-label={`Diminuir ${label?.toLowerCase() ?? "valor"}`}
          >
            <Minus className="h-5 w-5" />
          </Button>
          <span
            aria-label={`Valor atual: ${value}`}
            aria-valuemax={max}
            aria-valuemin={min}
            aria-valuenow={value}
            role="spinbutton"
            className="flex-1 text-center text-lg font-semibold tabular-nums"
          >
            {value}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleIncrement}
            disabled={disabled || value >= max}
            className="h-12 w-12 rounded-none border-l border-border hover:bg-muted/50"
            aria-label={`Aumentar ${label?.toLowerCase() ?? "valor"}`}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </fieldset>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
