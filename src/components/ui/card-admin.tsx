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
        "group relative overflow-hidden rounded-xl border border-primary/20 bg-card p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
            <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-1">
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
