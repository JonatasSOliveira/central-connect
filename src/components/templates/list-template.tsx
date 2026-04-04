import {
  ChevronRight,
  type LucideIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { type MouseEvent, useState } from "react";
import { PrivateHeader } from "@/components/modules/private-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SearchInput } from "@/components/ui/search-input";
import { cn } from "@/lib/utils";

interface ListTemplateProps {
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

interface ListItemActions {
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
}

interface ListItemProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  onClick?: () => void;
  href?: string;
  actions?: ListItemActions;
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

interface ListSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  resultsCount?: number;
  className?: string;
}

function List({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 mt-4">{children}</div>;
}

function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Buscar...",
  resultsCount,
  className,
}: ListSearchBarProps) {
  return (
    <div className={cn("space-y-3 mb-4", className)}>
      <SearchInput
        value={value}
        onChange={onChange}
        onClear={onClear}
        placeholder={placeholder}
      />
      {value && resultsCount !== undefined && (
        <p className="text-xs text-muted-foreground">
          {resultsCount} resultado{resultsCount !== 1 ? "s" : ""} para "{value}"
        </p>
      )}
    </div>
  );
}

function ListItem({
  icon: Icon,
  title,
  description,
  onClick,
  href,
  actions,
  className,
}: ListItemProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    actions?.onDelete?.();
  };

  const deleteDialogTitle = actions?.deleteLabel || "Excluir registro";
  const deleteDialogDescription = `Tem certeza que deseja excluir "${title}"? Esta ação não pode ser desfeita.`;

  const deleteDialog = actions?.onDelete ? (
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{deleteDialogTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {deleteDialogDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteConfirm}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ) : null;

  const itemContent = (
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
      {actions && (
        <Popover>
          <PopoverTrigger
            onClick={(e) => e.stopPropagation()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <MoreHorizontal className="h-5 w-5" />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-40 p-1">
            {actions.onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  actions.onEdit?.();
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <Pencil className="h-4 w-4" />
                {actions.editLabel || "Editar"}
              </button>
            )}
            {actions.onDelete && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                {actions.deleteLabel || "Excluir"}
              </button>
            )}
          </PopoverContent>
        </Popover>
      )}
      {!actions && (href || onClick) && (
        <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
      )}
    </>
  );

  const baseClasses =
    "flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4 transition-all duration-200";

  if (href) {
    return (
      <>
        <a
          href={href}
          className={cn(
            baseClasses,
            "hover:border-primary/30 hover:shadow-sm hover:shadow-primary/5",
            className,
          )}
        >
          {itemContent}
        </a>
        {deleteDialog}
      </>
    );
  }

  if (actions) {
    return (
      <>
        <div className={cn(baseClasses, className)}>{itemContent}</div>
        {deleteDialog}
      </>
    );
  }

  if (onClick) {
    return (
      <>
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "w-full text-left",
            baseClasses,
            "hover:border-primary/30 hover:shadow-sm hover:shadow-primary/5",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
            className,
          )}
        >
          {itemContent}
        </button>
        {deleteDialog}
      </>
    );
  }

  return (
    <>
      <div className={cn(baseClasses, className)}>{itemContent}</div>
      {deleteDialog}
    </>
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
    <div className={cn("flex justify-end", className)}>
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

export function ListTemplate({
  children,
  className,
  isLoading,
}: ListTemplateProps) {
  if (isLoading) {
    return (
      <div className={cn("p-6 app-background", className)}>
        <div className="flex items-center justify-center py-12">
          <svg
            role="status"
            aria-label="Carregando"
            className="animate-spin h-6 w-6 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
    );
  }

  return <div className={cn("p-6 app-background", className)}>{children}</div>;
}

ListTemplate.Header = PrivateHeader;
ListTemplate.List = List;
ListTemplate.SearchBar = SearchBar;
ListTemplate.Item = ListItem;
ListTemplate.Action = Action;
ListTemplate.EmptyState = EmptyStateComponent;

export { Action, EmptyStateComponent, List, ListItem };
