"use client";

import { type LucideIcon, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ScaleItemActions {
  onEdit?: () => void;
  onDelete?: () => void;
}

interface ScaleItemProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  status?: "draft" | "published";
  onClick?: () => void;
  actions?: ScaleItemActions;
  className?: string;
}

export function ScaleItem({
  icon: Icon,
  title,
  description,
  status,
  onClick,
  actions,
  className,
}: ScaleItemProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    actions?.onDelete?.();
  };

  const statusBadge = status ? (
    <span
      className={cn(
        "px-2 py-0.5 text-xs rounded-full",
        status === "published"
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
      )}
    >
      {status === "published" ? "Publicada" : "Rascunho"}
    </span>
  ) : null;

  const deleteDialog = actions?.onDelete ? (
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir escala</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a escala "{title}"? Esta ação não
            pode ser desfeita.
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
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-[15px] text-foreground truncate">
            {title}
          </h3>
          {statusBadge}
        </div>
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
            aria-label="Opções"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
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
                Editar
              </button>
            )}
            {actions.onDelete && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </button>
            )}
          </PopoverContent>
        </Popover>
      )}
    </>
  );

  const baseClasses =
    "flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4 transition-all duration-200";

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
