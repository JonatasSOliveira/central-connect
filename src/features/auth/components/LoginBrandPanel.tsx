import { CalendarDays, ClipboardCheck, UsersRound } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const benefits = [
  { icon: CalendarDays, label: "Consulte suas escalas com facilidade" },
  { icon: UsersRound, label: "Cultos e equipes organizados" },
  {
    icon: ClipboardCheck,
    label: "Acompanhe responsabilidades e compromissos",
  },
];

export function LoginBrandPanel() {
  return (
    <section className="relative flex overflow-hidden bg-primary-hover px-6 py-9 text-primary-foreground lg:min-h-dvh lg:w-[42%] lg:px-12 lg:py-16">
      <div className="absolute -right-20 -top-24 size-64 rounded-full border border-primary-foreground/10" />
      <div className="absolute -bottom-32 -left-24 size-80 rounded-full border border-primary-foreground/10" />

      <div className="relative mx-auto flex w-full max-w-lg flex-col lg:justify-center">
        <Logo
          variant="light"
          className="h-16 w-16 lg:h-24 lg:w-24"
          priority
        />

        <div className="mt-5 max-w-md lg:mt-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary-foreground/75">
            Central Connect
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Escalas, cultos e equipes da sua igreja, em um só lugar.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-primary-foreground/85 sm:text-base">
            Organize cultos, equipes e responsabilidades com mais clareza e
            tranquilidade.
          </p>
        </div>

        <ul className="mt-10 hidden space-y-4 lg:block" aria-label="Recursos">
          {benefits.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary-foreground/10">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
