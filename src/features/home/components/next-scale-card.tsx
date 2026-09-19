import { CalendarDays, ChevronRight, Clock3 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { MyScaleItem } from "@/features/my-scales/hooks/useMyScales";

export function NextScaleCard({ scale }: { scale: MyScaleItem | null }) {
  const router = useRouter();

  if (!scale) {
    return (
      <section className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5">
        <CalendarDays className="h-6 w-6 text-primary" />
        <h2 className="mt-3 font-heading text-lg font-semibold">Nenhuma escala próxima</h2>
        <p className="mt-1 text-sm text-muted-foreground">Quando você for escalado, seu próximo compromisso aparecerá aqui.</p>
      </section>
    );
  }

  const serviceDate = new Date(scale.serviceDate).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <button
      type="button"
      onClick={() => router.push("/my-scales")}
      className="w-full overflow-hidden rounded-2xl bg-primary p-5 text-left text-primary-foreground shadow-sm transition-transform active:scale-[0.99]"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">Sua próxima escala</p>
      <h2 className="mt-2 font-heading text-2xl font-bold">{scale.serviceTitle}</h2>
      <p className="mt-1 flex items-center gap-2 text-sm text-primary-foreground/80 capitalize">
        <Clock3 className="h-4 w-4" /> {serviceDate} · {scale.serviceTime}
      </p>
      <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4">
        <p className="text-sm font-semibold">{scale.ministryName} · {scale.ministryRoleName}</p>
        <ChevronRight className="h-5 w-5" />
      </div>
    </button>
  );
}
