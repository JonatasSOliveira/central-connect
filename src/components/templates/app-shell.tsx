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
    <div className="min-h-dvh bg-background">
      <main
        className={cn(
          "mx-auto min-h-dvh w-full max-w-3xl px-4 pt-20",
          showNavigation && "pb-24",
          className,
        )}
      >
        {children}
      </main>
      {showNavigation && <BottomNavigation />}
    </div>
  );
}
