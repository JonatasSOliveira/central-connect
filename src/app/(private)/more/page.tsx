"use client";

import { Bell, Building2, LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PrivateHeader } from "@/components/modules/private-header";
import { CardItem } from "@/components/ui/card-item";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useChurchStore } from "@/stores/churchStore";

export default function MorePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { selectedChurch } = useChurchStore();
  const [showLogout, setShowLogout] = useState(false);
  const churchId = selectedChurch?.id ?? user?.churchId;

  return (
    <div className="space-y-6 py-2">
      <PrivateHeader title="Mais" />

      <section className="rounded-2xl bg-primary p-5 text-primary-foreground">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-xl font-bold">
            {user?.fullName?.slice(0, 2).toUpperCase() ?? "CC"}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-primary-foreground/75">Sua conta</p>
            <h1 className="truncate font-heading text-xl font-bold">{user?.fullName ?? "Usuário"}</h1>
            <p className="truncate text-xs text-primary-foreground/75">{user?.email}</p>
          </div>
        </div>
      </section>

      <div className="space-y-3">
        <CardItem title="Meu perfil" description="Edite seus dados pessoais" icon={UserRound} onClick={() => user?.memberId && router.push(`/members/${user.memberId}/edit?selfEdit=true`)} />
        {churchId && (
          <CardItem title="Dados da igreja" description="Visualize ou edite a igreja atual" icon={Building2} onClick={() => router.push(`/churches/${churchId}/edit`)} />
        )}
        <CardItem title="Notificações" description="Gerencie seus alertas do aplicativo" icon={Bell} onClick={() => router.push("/home#notifications")} />
        {user?.churches && user.churches.length > 1 && (
          <CardItem title="Trocar de igreja" description="Altere o contexto da igreja atual" icon={Building2} onClick={() => router.push("/select-church")} />
        )}
        <CardItem title="Sair" description="Encerrar sessão atual" icon={LogOut} variant="destructive" onClick={() => setShowLogout(true)} />
      </div>

      <p className="pb-2 text-center text-xs text-muted-foreground">Central Connect</p>

      <AlertDialog open={showLogout} onOpenChange={setShowLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair do Central Connect?</AlertDialogTitle>
            <AlertDialogDescription>Você poderá entrar novamente com sua conta Google.</AlertDialogDescription>
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
