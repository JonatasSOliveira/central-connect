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
  onShareImage?: () => void;
}

interface ScaleItemProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  tertiary?: string;
  description?: string;
  status?: "draft" | "published";
  onClick?: () => void;
  actions?: ScaleItemActions;
  className?: string;
}

export function ScaleItem({
  icon: Icon,
  title,
  subtitle,
  tertiary,
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
        "rounded-full border px-2 py-0.5 text-xs",
        status === "published"
          ? "border-primary/30 bg-primary/10 text-primary-selected"
          : "border-border bg-muted text-muted-foreground",
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

  const itemContent = (
    <>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-[15px] text-foreground truncate">
            {title}
          </h3>
          {statusBadge}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {subtitle}
          </p>
        )}
        {tertiary && (
          <p className="text-xs text-muted-foreground/70 truncate">
            {tertiary}
          </p>
        )}
        {description && !subtitle && !tertiary && (
          <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
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
            {actions.onShareImage && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  actions.onShareImage?.();
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
                  <path d="M12 16V4" />
                  <path d="m7 9 5-5 5 5" />
                </svg>
                Compartilhar
              </button>
            )}
          </PopoverContent>
        </Popover>
      )}
    </>
  );

  const baseClasses =
    "flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft-sm)] transition-all duration-200";

  if (onClick) {
    return (
      <>
        {/* biome-ignore lint: div required to avoid nested button with PopoverTrigger */}
        <div
          role="button"
          tabIndex={0}
          onClick={onClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClick();
            }
          }}
          className={cn(
            "w-full text-left",
            baseClasses,
            "hover:border-primary/40 hover:shadow-[var(--shadow-soft)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
            className,
          )}
        >
          {itemContent}
        </div>
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
