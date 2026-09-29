import Image from "next/image";
import { Logo } from "@/components/ui/logo";
import { ChurchContextSwitcher } from "@/features/churches/components/ChurchContextSwitcher";

interface HomeHeaderProps {
  fullName: string;
  avatarUrl: string | null;
  churchId: string | null;
  churchName: string | null;
  churchCount: number;
  canCreateChurch: boolean;
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

export function HomeHeader({
  fullName,
  avatarUrl,
  churchId,
  churchName,
  churchCount,
  canCreateChurch,
}: HomeHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-primary-foreground/10 bg-primary text-primary-foreground shadow-[var(--shadow-soft-sm)]">
      <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Logo
            variant="light"
            className="size-9 shrink-0 sm:size-10"
            priority
          />
          <span className="hidden truncate font-heading text-lg font-semibold sm:block sm:text-xl">
            Central Connect
          </span>
        </div>

        <ChurchContextSwitcher
          churchId={churchId}
          churchName={churchName}
          churchCount={churchCount}
          canCreateChurch={canCreateChurch}
          tone="primary"
        />

        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-foreground/15 text-sm font-semibold ring-1 ring-primary-foreground/20">
          {avatarUrl ? (
            <Image
              loader={({ src }) => src}
              src={avatarUrl}
              alt={fullName}
              width={40}
              height={40}
              unoptimized
              className="size-full object-cover"
            />
          ) : (
            getInitials(fullName || "Usuário")
          )}
        </div>
      </div>
    </header>
  );
}
