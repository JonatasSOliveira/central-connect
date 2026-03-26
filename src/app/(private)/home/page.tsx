"use client";

import { useState } from "react";
import {
  Church,
  Building2,
  UserRoundKey,
  Users,
  LogOut,
  HandHeart,
} from "lucide-react";
import { useHomeScreen } from "@/features/home/hooks/useHomeScreen";
import { CardAdmin } from "@/components/ui/card-admin";
import { CardItem } from "@/components/ui/card-item";
import { PrivateHeader } from "@/components/modules/private-header";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useAuth } from "@/features/auth/hooks/useAuth";
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

export default function HomePage() {
  const { userName, selectedChurch } = useHomeScreen();
  const { logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const { hasPermission: canManageMembers } = usePermissions({
    requiredPermissions: [Permission.MEMBER_READ],
  });

  const { hasPermission: canManageRoles } = usePermissions({
    requiredPermissions: [Permission.ROLE_READ],
  });

  const { hasPermission: canManageChurches } = usePermissions({
    requiredPermissions: [Permission.CHURCH_READ],
  });

  const { hasPermission: canManageMinistries } = usePermissions({
    requiredPermissions: [Permission.MINISTRY_READ],
  });

  const canShowAdminSection =
    canManageMembers ||
    canManageRoles ||
    canManageChurches ||
    canManageMinistries;

  return (
    <div className="p-6 app-background">
      <div className="max-w-2xl mx-auto">
        <PrivateHeader title={`Olá, ${userName}`} showBackButton={false} />

        <div className="py-4">
          <p>Acessando a igreja {selectedChurch?.name}</p>
        </div>

        {canShowAdminSection && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Configurações
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-1 gap-3 mb-6">
              {canManageChurches && (
                <CardAdmin
                  title="Igrejas"
                  description="Gerencie as igrejas cadastradas"
                  icon={Building2}
                  href="/churches"
                />
              )}
              {canManageMembers && (
                <CardAdmin
                  title="Membros"
                  description="Gerencie os membros da igreja"
                  icon={Users}
                  href="/members"
                />
              )}
              {canManageRoles && (
                <CardAdmin
                  title="Cargos do Sistema"
                  description="Gerencie as permissões dos cargos do sistema"
                  icon={UserRoundKey}
                  href="/roles"
                />
              )}
              {canManageMinistries && (
                <CardAdmin
                  title="Ministérios"
                  description="Gerencie os ministérios da igreja"
                  icon={HandHeart}
                  href="/ministries"
                />
              )}
            </div>
          </>
        )}

        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Ações Rápidas
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="grid grid-cols-1 gap-3 mb-6">
          <CardItem
            title="Minhas Escalas"
            description="Veja suas próximas atividades"
            icon={Church}
          />
        </div>

        <CardItem
          title="Sair"
          description="Encerrar sessão atual"
          icon={LogOut}
          onClick={() => setShowLogoutDialog(true)}
          variant="destructive"
        />
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
