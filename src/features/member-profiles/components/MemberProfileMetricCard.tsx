import type { LucideIcon } from "lucide-react";

interface MemberProfileMetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
}

export function MemberProfileMetricCard({
  title,
  value,
  icon: Icon,
  description,
}: MemberProfileMetricCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            {title}
          </p>
          <p className="font-heading text-2xl font-bold text-foreground">
            {value}
          </p>
        </div>
      </div>
      {description && (
        <p className="mt-3 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
