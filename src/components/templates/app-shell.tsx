import type { ReactNode } from "react";
import { BottomNavigation } from "@/components/modules/bottom-navigation";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  className?: string;
  showNavigation?: boolean;
}

export function AppShell({
  children,
  className,
  showNavigation = true,
}: AppShellProps) {
  return (
    <div className="min-h-dvh overflow-y-auto bg-background">
      <div
        className={cn(
          "mx-auto min-h-full w-full max-w-3xl px-4 pb-20 pt-20",
          showNavigation && "pb-28",
          className,
        )}
      >
        {children}
      </div>
      {showNavigation && <BottomNavigation />}
    </div>
  );
}
