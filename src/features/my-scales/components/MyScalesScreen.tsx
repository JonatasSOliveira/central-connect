"use client";

import { CalendarDays, Clock3 } from "lucide-react";
import { PrivateHeader } from "@/components/modules/private-header";
import { cn } from "@/lib/utils";
import { useMyScales } from "../hooks/useMyScales";

function formatDateLabel(dateIso: string): string {
  const date = new Date(dateIso);
  return date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function MyScalesScreen() {
  const { activeTab, setActiveTab, isLoading, currentAndFuture, past } =
    useMyScales();

  const items = activeTab === "current" ? currentAndFuture : past;

  return (
    <div className="min-h-screen app-background">
      <div className="mx-auto max-w-2xl p-4 pb-6">
        <PrivateHeader
          title="Minhas Escalas"
          subtitle="Veja onde voce esta escalado"
          backHref="/home"
        />

        <div className="mb-4 mt-4 grid grid-cols-2 gap-2 rounded-xl border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setActiveTab("current")}
            className={cn(
              "h-10 rounded-lg text-sm font-medium transition-colors",
              activeTab === "current"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            Atuais e futuras
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("past")}
            className={cn(
              "h-10 rounded-lg text-sm font-medium transition-colors",
              activeTab === "past"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            Passadas
          </button>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              {activeTab === "current"
                ? "Nenhuma escala atual ou futura encontrada."
                : "Nenhuma escala passada encontrada."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <article
                key={`${item.scaleId}-${item.ministryRoleName}`}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span>{formatDateLabel(item.serviceDate)}</span>
                  <span className="text-muted-foreground">-</span>
                  <span>{item.serviceTime}</span>
                </div>

                <div className="grid gap-2 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Ministerio
                    </p>
                    <p className="text-foreground">{item.ministryName}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Funcao
                    </p>
                    <p className="flex items-center gap-1 text-foreground">
                      <Clock3 className="h-3.5 w-3.5 text-primary" />
                      {item.ministryRoleName}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
