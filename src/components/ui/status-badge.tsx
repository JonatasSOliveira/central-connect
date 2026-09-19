import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatusBadgeStatus =
  | "draft"
  | "published"
  | "complete"
  | "partial"
  | "pending"
  | "present"
  | "absent";

const statusClasses: Record<StatusBadgeStatus, string> = {
  draft: "border-amber-500/25 bg-amber-500/10 text-amber-700",
  published: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700",
  complete: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700",
  partial: "border-amber-500/25 bg-amber-500/10 text-amber-700",
  pending: "border-border bg-muted text-muted-foreground",
  present: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700",
  absent: "border-destructive/25 bg-destructive/10 text-destructive",
};

export function StatusBadge({
  status,
  children,
  className,
}: {
  status: StatusBadgeStatus;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        statusClasses[status],
        className,
      )}
    >
      {children}
    </span>
  );
}
