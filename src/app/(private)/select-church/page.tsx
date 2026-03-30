"use client";

import { Church, Loader2, LogOut } from "lucide-react";
import { CardItem } from "@/components/ui/card-item";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSelectChurchScreen } from "@/features/churches/hooks/useSelectChurch";
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
import { useRouter } from "next/navigation";

export default function SelectChurchPage() {
  const router = useRouter();

  const {
    churches,
    loadingChurches,
    handleSelectChurch,
    showLogoutDialog,
    setShowLogoutDialog,
  } = useSelectChurchScreen({
    goToHome: () => router.push("/home"),
  });

  const { logout } = useAuth();

  if (loadingChurches) {
    return (
      <div className="h-dvh flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex flex-col items-center p-6 pb-4">
        <img
          src="/logo-central-redonda.svg"
          alt="Central Connect"
          className="w-20 h-20 object-contain mb-4"
        />

        <h1 className="font-heading text-2xl font-bold text-foreground text-center">
          Selecione uma igreja
        </h1>
        <p className="text-muted-foreground text-center mt-2 text-sm">
          Você pertence a {churches.length} igreja
          {churches.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 min-h-0">
        <div className="max-w-sm mx-auto space-y-3">
          {churches.map((church) => (
            <CardItem
              key={church.id}
              title={church.name}
              description="Toque para selecionar"
              icon={Church}
              onClick={() => handleSelectChurch(church)}
            />
          ))}
        </div>
      </div>

      <div className="p-6 pt-4 bg-background border-t border-border shrink-0">
        <div className="max-w-sm mx-auto">
          <CardItem
            title="Sair"
            description="Encerrar sessão atual"
            icon={LogOut}
            onClick={() => setShowLogoutDialog(true)}
            variant="destructive"
          />
        </div>
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
