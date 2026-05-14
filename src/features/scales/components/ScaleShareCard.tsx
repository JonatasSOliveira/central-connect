import type { ShareScaleView } from "../types/shareScale";

interface ScaleShareCardProps {
  data: ShareScaleView;
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-5">
      <p className="text-xl font-semibold text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}

export function ScaleShareCard({ data }: ScaleShareCardProps) {
  const groupedMembers = Array.from(
    data.members.reduce((acc, member) => {
      const current = acc.get(member.roleName) ?? [];
      current.push(member.memberName);
      acc.set(member.roleName, current);
      return acc;
    }, new Map<string, string[]>()),
  )
    .map(([roleName, memberNames]) => ({
      roleName,
      memberNames: memberNames.sort((a, b) =>
        a.localeCompare(b, "pt-BR", { sensitivity: "base" }),
      ),
    }))
    .sort((a, b) =>
      a.roleName.localeCompare(b.roleName, "pt-BR", { sensitivity: "base" }),
    );

  return (
    <section className="w-[1080px] bg-background p-10 text-foreground">
      <header className="rounded-3xl border border-primary/20 bg-card p-7">
        <div className="flex items-center gap-5 border-b border-border pb-6">
          <img
            src="/logo-central-redonda.svg"
            alt="Central Connect"
            className="h-24 w-24 object-contain"
          />
          <div>
            <p className="font-heading text-2xl text-primary">Central Connect</p>
            <h1 className="font-heading text-6xl font-bold">Escala Publicada</h1>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <InfoItem label="Igreja" value={data.churchName} />
          <InfoItem label="Ministério" value={data.ministryName} />
          <InfoItem label="Culto" value={data.serviceTitle} />
          <InfoItem
            label="Data e horário"
            value={`${data.serviceDateLabel} - ${data.serviceTime}`}
          />
        </div>

        {data.notes ? (
          <div className="mt-4 rounded-2xl border border-border bg-muted/30 p-5">
            <p className="text-xl font-semibold text-muted-foreground">Observações</p>
            <p className="mt-1 text-2xl text-foreground">{data.notes}</p>
          </div>
        ) : null}
      </header>

      <main className="mt-6 rounded-3xl border border-primary/20 bg-card p-7">
        <h2 className="font-heading text-5xl font-bold">Membros escalados</h2>
        <div className="mt-5 space-y-5">
          {groupedMembers.map((group) => (
            <section
              key={group.roleName}
              className="rounded-2xl border border-border bg-background px-5 py-4"
            >
              <p className="text-3xl font-bold text-primary">{group.roleName}</p>
              <ul className="mt-3 space-y-2">
                {group.memberNames.map((memberName) => (
                  <li key={`${group.roleName}-${memberName}`}>
                    <p className="text-2xl font-medium">{memberName}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </section>
  );
}
