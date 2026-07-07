import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardAdminProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
  href?: string;
}

export function CardAdmin({
  title,
  description,
  icon: Icon,
  className,
  href,
}: CardAdminProps) {
  const content = (
    <div
      className={cn(
        "app-surface-interactive group relative overflow-hidden p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="app-icon-tile h-12 w-12 group-hover:bg-primary/15">
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="mb-1 text-base font-semibold text-foreground">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {href && (
          <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
}
