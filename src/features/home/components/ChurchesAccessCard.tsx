import { ArrowRight, Church } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChurchesAccessCardProps {
  isSuperAdmin: boolean;
  hasChurches: boolean;
  needsSelection?: boolean;
  onOpen: () => void;
}

export function ChurchesAccessCard({
  isSuperAdmin,
  hasChurches,
  needsSelection = false,
  onOpen,
}: ChurchesAccessCardProps) {
  const description = needsSelection
    ? "Selecione uma igreja para acessar os membros e demais dados dela."
    : isSuperAdmin
      ? hasChurches
        ? "Gerencie as igrejas cadastradas na plataforma."
        : "Cadastre a primeira igreja da plataforma para começar."
      : "Veja as igrejas às quais você pertence.";
  const actionLabel = needsSelection ? "Selecionar igreja" : "Acessar igrejas";

  return (
    <section className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Church className="size-6" aria-hidden="true" />
      </div>

      <h2 className="mt-5 font-heading text-2xl font-semibold tracking-tight text-foreground">
        Igrejas
      </h2>
      <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
        {description}
      </p>

      <Button
        type="button"
        size="lg"
        className="mt-6 h-12 w-full gap-2 sm:w-auto"
        onClick={onOpen}
      >
        {actionLabel}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </section>
  );
}
