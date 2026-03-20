import { ChevronRight, type LucideIcon } from "lucide-react";
import { PrivateHeader } from "@/components/modules/private-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface ListTemplateProps {
  children: React.ReactNode;
  className?: string;
}

interface ListItemProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  onClick?: () => void;
  href?: string;
  className?: string;
}

interface ListActionProps {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

interface ListEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

function List({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3">{children}</div>;
}

function ListItem({
  icon: Icon,
  title,
  description,
  onClick,
  href,
  className,
}: ListItemProps) {
  const content = (
    <>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
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
      {(href || onClick) && (
        <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={cn(
          "group flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4 transition-all duration-200",
          "hover:border-primary/30 hover:shadow-sm hover:shadow-primary/5",
          className,
        )}
      >
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "group flex w-full items-center gap-4 rounded-xl border border-border/50 bg-card p-4 text-left transition-all duration-200",
          "hover:border-primary/30 hover:shadow-sm hover:shadow-primary/5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4",
        className,
      )}
    >
      {content}
    </div>
  );
}

function Action({
  label,
  icon: Icon,
  onClick,
  disabled,
  className,
}: ListActionProps) {
  return (
    <div className={cn("flex justify-end mb-4", className)}>
      <Button onClick={onClick} disabled={disabled}>
        <Icon className="w-4 h-4 mr-2" />
        {label}
      </Button>
    </div>
  );
}

function EmptyStateComponent({
  icon,
  title,
  description,
  action,
  className,
}: ListEmptyStateProps) {
  if (action) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12 px-4",
          className,
        )}
      >
        <EmptyState icon={icon} title={title} description={description} />
        <div className="mt-4">
          <Button onClick={action.onClick}>{action.label}</Button>
        </div>
      </div>
    );
  }

  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      className={className}
    />
  );
}

export function ListTemplate({ children, className }: ListTemplateProps) {
  return <div className={cn("p-6 app-background", className)}>{children}</div>;
}

ListTemplate.Header = PrivateHeader;
ListTemplate.List = List;
ListTemplate.Item = ListItem;
ListTemplate.Action = Action;
ListTemplate.EmptyState = EmptyStateComponent;

export { Action, EmptyStateComponent, List, ListItem };
