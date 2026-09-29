interface HomeWelcomeProps {
  fullName: string;
}

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function HomeWelcome({ fullName }: HomeWelcomeProps) {
  return (
    <section aria-labelledby="home-welcome-title">
      <p className="text-sm font-medium text-primary">{getTimeOfDayGreeting()}</p>
      <h1
        id="home-welcome-title"
        className="mt-1 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
      >
        Olá, {fullName}
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
        Acesse as igrejas disponíveis para você.
      </p>
    </section>
  );
}
