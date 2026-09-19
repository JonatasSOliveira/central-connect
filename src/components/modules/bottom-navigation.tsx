"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getNavigationItems } from "@/features/navigation/navigationItems";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  const items = getNavigationItems(user ?? {});

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="safe-area-bottom mx-auto flex h-16 max-w-3xl items-center justify-around px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 min-w-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium transition-colors",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
              <span className="max-w-20 truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
