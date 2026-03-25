"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NumberStepperProps {
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
  value,
  onChange,
  min = 0,
  max = 99,
  label,
  error,
  disabled = false,
  className,
}: NumberStepperProps) {
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
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
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
          aria-label="Diminuir"
        >
          <Minus className="h-5 w-5" />
        </Button>
        <span className="flex-1 text-center font-semibold text-lg tabular-nums">
          {value}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className="h-12 w-12 rounded-none border-l border-border hover:bg-muted/50"
          aria-label="Aumentar"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
