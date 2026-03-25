import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardItemProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  className?: string;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "destructive";
}

export function CardItem({
  title,
  description,
  icon: Icon,
  className,
  onClick,
  href,
  variant = "default",
}: CardItemProps) {
  const iconBgClass =
    variant === "destructive" ? "bg-destructive/10" : "bg-primary/10";
  const iconColorClass =
    variant === "destructive" ? "text-destructive" : "text-primary";
  const hoverClass =
    variant === "destructive" ? "hover:bg-destructive/5" : "hover:bg-muted/50";

  const cardContent = (
    <>
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          iconBgClass,
        )}
      >
        <Icon className={cn("h-5 w-5", iconColorClass)} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-[15px] text-foreground truncate">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {description}
          </p>
        )}
      </div>
      {href && (
        <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={cn(
          "group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200",
          hoverClass,
          className,
        )}
      >
        {cardContent}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all duration-200",
          hoverClass,
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
      >
        {cardContent}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border border-border bg-card p-4",
        className,
      )}
    >
      {cardContent}
    </div>
  );
}
