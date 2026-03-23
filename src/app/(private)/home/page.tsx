"use client";

import { Church, Building2, UserRoundKey } from "lucide-react";
import { useHomeScreen } from "@/features/home/hooks/useHomeScreen";
import { CardAdmin } from "@/components/ui/card-admin";
import { CardItem } from "@/components/ui/card-item";
import { PrivateHeader } from "@/components/modules/private-header";

export default function HomePage() {
  const { userName, isSuperAdmin } = useHomeScreen();

  return (
    <div className="p-6 app-background">
      <div className="max-w-2xl mx-auto">
        <PrivateHeader title={`Olá, ${userName}`} showBackButton={false} />

        {isSuperAdmin && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Configurações
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-1 gap-3 mb-6">
              <CardAdmin
                title="Igrejas"
                description="Gerencie as igrejas cadastradas"
                icon={Building2}
                href="/churches"
              />
              <CardAdmin
                title="Cargos"
                description="Gerencie as permissões dos cargos"
                icon={UserRoundKey}
                href="/roles"
              />
            </div>
          </>
        )}

        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Ações Rápidas
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <CardItem
            title="Minhas Escalas"
            description="Veja suas próximas atividades"
            icon={Church}
          />
        </div>
      </div>
    </div>
  );
}
