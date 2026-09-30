"use client";

import { usePathname } from "next/navigation";

const publicRoutes = ["/", "/login", "/components"];

function isPublicRoute(pathname: string): boolean {
  return (
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/legal/") ||
    pathname.startsWith("/self-signup/")
  );
}

export function Footer() {
  const pathname = usePathname();

  if (!isPublicRoute(pathname)) {
    return null;
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 h-14 flex items-center justify-center safe-area-bottom bg-background border-t">
      <p className="text-xs text-muted-foreground/60">
        Desenvolvido por Milnatix LTDA.
      </p>
    </footer>
  );
}
