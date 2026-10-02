import { ChevronRight, type LucideIcon, Pencil, Trash2 } from "lucide-react";
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
import { Action, SearchBar, Toolbar } from "./list-template-toolbar";
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

interface ListEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    buttonClassName?: string;
  };
  className?: string;
}

function List({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 mt-4">{children}</div>;
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
          <AlertDialogAction
            variant="destructive"
            onClick={handleDeleteConfirm}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ) : null;

  const mainContent = (
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
    </>
  );

  const deleteAction = actions?.onDelete ? (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      onClick={handleDeleteClick}
      aria-label={`${actions.deleteLabel || "Excluir"} ${title}`}
      className="w-full sm:w-auto"
    >
      <Trash2 className="h-4 w-4" />
      {actions.deleteLabel || "Excluir"}
    </Button>
  ) : null;

  const editAction = actions?.onEdit ? (
    <Button
      type="button"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        actions.onEdit?.();
      }}
      aria-label={`${actions.editLabel || "Editar"} ${title}`}
      className="w-full sm:w-auto"
    >
      <Pencil className="h-4 w-4" />
      {actions.editLabel || "Editar"}
    </Button>
  ) : null;

  const itemContent = (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {mainContent}
      </div>
      {!actions && (href || onClick) && (
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
      )}
    </>
  );

  const interactiveMainContent = onClick && !actions ? (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Abrir ${title}`}
      className="flex min-w-0 flex-1 items-center gap-4 rounded-lg px-1 py-1 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {itemContent}
    </button>
  ) : (
    <div className="flex min-w-0 flex-1 items-center gap-4">{mainContent}</div>
  );

  const baseClasses =
    "flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft-sm)] transition-all duration-200";

  if (actions) {
    return (
      <>
        <div className={cn(baseClasses, "flex-col items-stretch sm:flex-row sm:items-center", className)}>
          {interactiveMainContent}
          <div className="flex w-full shrink-0 gap-2 sm:w-auto">
            {editAction}
            {deleteAction}
          </div>
        </div>
        {deleteDialog}
      </>
    );
  }

  if (href) {
    return (
      <>
        <a
          href={href}
          className={cn(
            baseClasses,
            "group hover:border-primary/40 hover:shadow-[var(--shadow-soft)]",
            className,
          )}
        >
          {itemContent}
        </a>
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
            "group w-full text-left",
            baseClasses,
            "cursor-pointer hover:border-primary/40 hover:shadow-[var(--shadow-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
          <Button
            size="lg"
            onClick={action.onClick}
            className={action.buttonClassName}
          >
            {action.label}
          </Button>
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
      <div className={cn("p-4 app-background sm:p-6", className)}>
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

  return (
    <div className={cn("p-4 app-background sm:p-6", className)}>{children}</div>
  );
}

ListTemplate.Header = PrivateHeader;
ListTemplate.List = List;
ListTemplate.SearchBar = SearchBar;
ListTemplate.Item = ListItem;
ListTemplate.Action = Action;
ListTemplate.Toolbar = Toolbar;
ListTemplate.EmptyState = EmptyStateComponent;

export { Action, EmptyStateComponent, List, ListItem, SearchBar, Toolbar };
