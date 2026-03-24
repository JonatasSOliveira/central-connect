import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-muted-foreground/20 bg-muted/20",
        className,
      )}
    >
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-base text-foreground mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        {description}
      </p>
    </div>
  );
}
