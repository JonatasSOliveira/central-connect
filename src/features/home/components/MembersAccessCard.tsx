import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MembersAccessCardProps {
  onOpen: () => void;
}

export function MembersAccessCard({ onOpen }: MembersAccessCardProps) {
  return (
    <section className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Users className="size-6" aria-hidden="true" />
      </div>

      <h2 className="mt-5 font-heading text-2xl font-semibold tracking-tight text-foreground">
        Membros
      </h2>
      <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
        Cadastre e organize as pessoas da sua igreja.
      </p>

      <Button
        type="button"
        size="lg"
        className="mt-6 h-12 w-full gap-2 sm:w-auto"
        onClick={onOpen}
      >
        Acessar membros
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </section>
  );
}
