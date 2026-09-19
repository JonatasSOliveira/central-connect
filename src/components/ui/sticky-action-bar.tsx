import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StickyActionBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-16 z-40 border-t border-border bg-background/95 p-4 backdrop-blur">
      <div className={cn("mx-auto flex max-w-3xl gap-3", className)}>{children}</div>
    </div>
  );
}
