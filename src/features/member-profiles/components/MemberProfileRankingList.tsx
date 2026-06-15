interface RankingItem {
  label: string;
  count: number;
}

interface MemberProfileRankingListProps {
  title: string;
  items: RankingItem[];
}

export function MemberProfileRankingList({
  title,
  items,
}: MemberProfileRankingListProps) {
  const maxCount = Math.max(...items.map((item) => item.count), 0);

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h2 className="font-heading text-base font-semibold text-foreground">
        {title}
      </h2>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem dados no filtro atual.</p>
        ) : (
          items.slice(0, 8).map((item) => {
            const width = maxCount > 0 ? `${(item.count / maxCount) * 100}%` : "0%";
            return (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-foreground">{item.label}</span>
                  <span className="shrink-0 font-medium text-muted-foreground">
                    {item.count}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
