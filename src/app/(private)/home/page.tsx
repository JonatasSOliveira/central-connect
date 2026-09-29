"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ChurchesAccessCard } from "@/features/home/components/ChurchesAccessCard";
import { HomeHeader } from "@/features/home/components/HomeHeader";
import { HomeWelcome } from "@/features/home/components/HomeWelcome";
import { MembersAccessCard } from "@/features/home/components/MembersAccessCard";
import { cn } from "@/lib/utils";
import { Permission } from "@/shared/domain/enums/Permission";

export default function HomePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const fullName = user?.fullName || "Usuário";
  const isSuperAdmin = user?.isSuperAdmin ?? false;
  const hasChurches = (user?.churches.length ?? 0) > 0;
  const hasSelectedChurch = Boolean(user?.churchId);
  const canAccessChurches =
    isSuperAdmin || user?.permissions.includes(Permission.CHURCH_READ);
  const canAccessMembers =
    isSuperAdmin || user?.permissions.includes(Permission.MEMBER_READ);
  const hasMembersAccess = canAccessMembers && hasSelectedChurch;
  const needsChurchSelection = hasChurches && !hasSelectedChurch;
  const hasAccessCards = canAccessChurches || hasMembersAccess;
  const hasMultipleAccessCards = canAccessChurches && hasMembersAccess;

  return (
    <div className="space-y-8 py-8 sm:space-y-10 sm:py-12">
      <HomeHeader
        fullName={fullName}
        avatarUrl={user?.avatarUrl ?? null}
        churchId={user?.churchId ?? null}
        churchName={user?.churchName ?? null}
        churchCount={user?.churches.length ?? 0}
        canCreateChurch={Boolean(
          user?.isSuperAdmin ||
            user?.permissions.includes(Permission.CHURCH_WRITE),
        )}
      />

      <HomeWelcome fullName={fullName} />

      {hasAccessCards ? (
        <div
          className={cn(
            "grid gap-4",
            hasMultipleAccessCards ? "sm:grid-cols-2" : "grid-cols-1",
          )}
        >
          {canAccessChurches && (
            <ChurchesAccessCard
              isSuperAdmin={isSuperAdmin}
              hasChurches={hasChurches}
              needsSelection={needsChurchSelection}
              onOpen={() =>
                router.push(
                  needsChurchSelection ? "/select-church" : "/churches",
                )
              }
            />
          )}
          {hasMembersAccess && (
            <MembersAccessCard onOpen={() => router.push("/members")} />
          )}
        </div>
      ) : (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Acesso em configuração
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
            Seu acesso ainda não possui uma área disponível. Fale com o
            administrador da sua igreja.
          </p>
        </section>
      )}

      <div className="border-t border-border pt-6">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
          onClick={() => setShowLogoutDialog(true)}
        >
          <LogOut className="size-4" aria-hidden="true" />
          Sair
        </Button>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja encerrar sua sessão?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={logout}>Sair</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
