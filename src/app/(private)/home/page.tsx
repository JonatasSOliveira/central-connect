"use client";

import { Church, Building2 } from "lucide-react";
import { useHomeScreen } from "@/features/home/hooks/useHomeScreen";
import { CardAdmin } from "@/components/ui/card-admin";
import { CardItem } from "@/components/ui/card-item";
import { PrivateHeader } from "@/components/modules/private-header";
import { PrivateFooter } from "@/components/modules/private-footer";

export default function HomePage() {
  const { userName, isSuperAdmin } = useHomeScreen();

  return (
    <main className="min-h-[100dvh] p-6 app-background flex flex-col">
      <div className="max-w-2xl mx-auto flex-1">
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
      <PrivateFooter />
    </main>
  );
}
