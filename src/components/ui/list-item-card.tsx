"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ListItemCardProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  onRemove?: () => void;
  canRemove?: boolean;
  index?: number;
  className?: string;
}

export function ListItemCard({
  children,
  actions,
  onRemove,
  canRemove = true,
  index,
  className,
}: ListItemCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 space-y-3",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        {index !== undefined && (
          <span className="text-xs font-medium text-muted-foreground">
            #{index + 1}
          </span>
        )}
        <div className="flex items-center gap-1">
          {actions}
          {canRemove && onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-10 w-10 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label="Remover"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
