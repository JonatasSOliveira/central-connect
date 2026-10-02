import type { ReactNode } from "react";
import { BottomNavigation } from "@/components/modules/bottom-navigation";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  className?: string;
  showNavigation?: boolean;
  scrollMode?: "page" | "contained";
}

export function AppShell({
  children,
  className,
  showNavigation = true,
  scrollMode = "page",
}: AppShellProps) {
  return (
    <div
      className={cn(
        "min-h-dvh bg-background",
        scrollMode === "contained" ? "overflow-hidden" : "overflow-y-auto",
      )}
    >
      <div
        className={cn(
          "mx-auto min-h-full w-full max-w-3xl px-4 pt-20",
          showNavigation ? "pb-28" : "pb-6",
          scrollMode === "contained" && "flex h-dvh min-h-0 flex-col overflow-hidden",
          className,
        )}
      >
        {children}
      </div>
      {showNavigation && <BottomNavigation />}
    </div>
  );
}
