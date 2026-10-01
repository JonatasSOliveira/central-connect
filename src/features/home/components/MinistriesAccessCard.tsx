import { ArrowRight, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MinistriesAccessCardProps {
  onOpen: () => void;
}

export function MinistriesAccessCard({ onOpen }: MinistriesAccessCardProps) {
  return (
    <section className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <HeartHandshake className="size-6" aria-hidden="true" />
      </div>
      <h2 className="mt-5 font-heading text-2xl font-semibold tracking-tight text-foreground">
        Ministérios
      </h2>
      <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
        Organize as áreas de atuação da sua igreja e suas funções.
      </p>
      <Button
        type="button"
        size="lg"
        className="mt-6 h-12 w-full gap-2 sm:w-auto"
        onClick={onOpen}
      >
        Acessar ministérios
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </section>
  );
}
