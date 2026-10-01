import { ArrowRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarAccessCardProps {
  onOpen: () => void;
}

export function CalendarAccessCard({ onOpen }: CalendarAccessCardProps) {
  return (
    <section className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <CalendarDays className="size-6" aria-hidden="true" />
      </div>

      <h2 className="mt-5 font-heading text-2xl font-semibold tracking-tight text-foreground">
        Agenda
      </h2>
      <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
        Consulte os cultos e as escalas da igreja em um só lugar.
      </p>

      <Button
        type="button"
        size="lg"
        className="mt-6 h-12 w-full gap-2 sm:w-auto"
        onClick={onOpen}
      >
        Abrir agenda
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </section>
  );
}
