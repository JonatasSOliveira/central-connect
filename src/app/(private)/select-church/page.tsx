"use client";

import { useState } from "react";
import { Building2, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface Church {
  churchId: string;
  roleId: string | null;
}

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
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm flex flex-col items-center animate-in fade-in zoom-in duration-500 flex-1 justify-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Building2 className="w-10 h-10 text-primary" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="font-heading text-2xl font-bold text-foreground text-center">
          Selecione uma igreja
        </h1>
        <p className="text-muted-foreground text-center mt-2">
          Você pertence a {churches.length} igreja
          {churches.length !== 1 ? "s" : ""}
        </p>

        <div className="w-full mt-8 space-y-3">
          {churches.map((church) => (
            <Button
              key={church.id}
              variant="outline"
              size="lg"
              className="w-full h-14 text-base font-medium justify-start px-4"
              onClick={() => handleSelectChurch(church)}
            >
              {church.name}
            </Button>
          ))}
        </div>

        <div className="mt-auto pt-8 w-full">
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
