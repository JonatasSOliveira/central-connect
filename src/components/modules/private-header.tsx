"use client";

import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ChurchContextSwitcher } from "@/features/churches/components/ChurchContextSwitcher";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Permission } from "@/shared/domain/enums/Permission";

interface PrivateHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backHref?: string;
  /** Mantido para compatibilidade com páginas legadas; o header usa a cor padrão do tema. */
  bgColor?: string;
  action?: ReactNode;
}

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function PrivateHeader({
  title,
  subtitle,
  showBackButton = true,
  backHref = "/home",
  action,
}: PrivateHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();

  const handleBack = () => {
    router.push(backHref);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-primary-foreground/10 bg-primary text-primary-foreground shadow-[var(--shadow-soft-sm)]">
      <div className="mx-auto flex h-16 w-full max-w-3xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            aria-label="Voltar"
            className="-ml-2 h-11 min-w-11 cursor-pointer px-2 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            onClick={handleBack}
          >
            <ChevronLeft className="size-5" />
          </Button>
        )}

        <Logo variant="light" className="size-9 shrink-0" priority />

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-heading text-base font-bold sm:text-lg">
            {title}
          </h1>
          {subtitle && <p className="truncate text-xs text-primary-foreground/75">{subtitle}</p>}
        </div>

        <ChurchContextSwitcher
          churchId={user?.churchId ?? null}
          churchName={user?.churchName ?? null}
          churchCount={user?.churches.length ?? 0}
          canCreateChurch={Boolean(
            user?.isSuperAdmin ||
              user?.permissions.includes(Permission.CHURCH_WRITE),
          )}
          tone="primary"
        />

        {action && <div className="shrink-0">{action}</div>}

        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-foreground/15 text-sm font-semibold ring-1 ring-primary-foreground/20">
          {user?.avatarUrl ? (
            <Image
              loader={({ src }) => src}
              src={user.avatarUrl}
              alt={user.fullName || "Usuário"}
              width={40}
              height={40}
              unoptimized
              className="size-full object-cover"
            />
          ) : (
            getInitials(user?.fullName || "Usuário")
          )}
        </div>
      </div>
    </header>
  );
}
