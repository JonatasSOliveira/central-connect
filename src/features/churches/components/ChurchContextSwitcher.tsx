"use client";

import { Building2, ChevronDown, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ChurchContextSwitcherProps {
  churchId: string | null;
  churchName: string | null;
  churchCount: number;
  canCreateChurch?: boolean;
  tone?: "primary" | "surface";
}

export function ChurchContextSwitcher({
  churchId,
  churchName,
  churchCount,
  canCreateChurch = false,
  tone = "surface",
}: ChurchContextSwitcherProps) {
  const router = useRouter();
  const hasSelectedChurch = Boolean(churchId && churchName);
  const hasChurches = churchCount > 0;
  const canCreate = !hasChurches && canCreateChurch;
  const canChangeChurch =
    hasChurches && (!hasSelectedChurch || churchCount > 1);
  const label = hasSelectedChurch
    ? churchName
    : hasChurches
      ? "Nenhuma igreja selecionada"
      : canCreate
        ? "Nenhuma igreja cadastrada"
        : "Igreja não disponível";
  const actionLabel = hasSelectedChurch
    ? "Trocar igreja"
    : hasChurches
      ? "Selecionar igreja"
      : canCreate
        ? "Cadastrar igreja"
        : "Acesso pendente";
  const isInteractive = canChangeChurch || canCreate;
  const contextClassName = cn(
    "group flex min-w-0 items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left transition-colors",
    tone === "primary"
      ? "border-primary-foreground/15 bg-primary-foreground/10 text-primary-foreground"
      : "border-border bg-card text-foreground",
    isInteractive &&
      (tone === "primary"
        ? "cursor-pointer hover:bg-primary-foreground/15 focus-visible:ring-primary-foreground"
        : "cursor-pointer hover:bg-muted"),
  );

  const handleClick = () => {
    if (canCreate) {
      router.push("/churches/new");
      return;
    }

    if (canChangeChurch) {
      router.push("/select-church");
    }
  };

  const content = (
    <>
      <Building2
        className={cn(
          "size-4 shrink-0",
          tone === "primary" ? "text-primary-foreground/80" : "text-primary",
        )}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 leading-tight">
        <span
          className={cn(
            "block text-[10px] font-medium uppercase tracking-wide",
            tone === "primary"
              ? "text-primary-foreground/70"
              : "text-muted-foreground",
          )}
        >
          {hasSelectedChurch ? "Igreja atual" : "Contexto da igreja"}
        </span>
        <span className="block truncate text-xs font-semibold sm:text-sm">
          {label}
        </span>
      </span>
      {canChangeChurch ? (
        <ChevronDown
          className="size-4 shrink-0 opacity-70"
          aria-hidden="true"
        />
      ) : !hasSelectedChurch ? (
        <ArrowRight className="size-4 shrink-0 opacity-70" aria-hidden="true" />
      ) : null}
    </>
  );

  if (!isInteractive) {
    return <div className={contextClassName}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`${hasSelectedChurch ? "Igreja atual" : label}. ${actionLabel}`}
      className={cn(
        contextClassName,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {content}
    </button>
  );
}
