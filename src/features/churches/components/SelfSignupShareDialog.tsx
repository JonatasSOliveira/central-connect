"use client";

import {
  Copy,
  ExternalLink,
  Link as LinkIcon,
  Printer,
  QrCode,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";

interface SelfSignupShareDialogProps {
  churchId: string;
  churchName?: string;
}

export function SelfSignupShareDialog({
  churchId,
  churchName,
}: SelfSignupShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const selfSignupUrl = useMemo(() => {
    if (!churchId) return "";
    if (!origin) return `/self-signup/${churchId}`;
    return `${origin}/self-signup/${churchId}`;
  }, [churchId, origin]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(selfSignupUrl);
      toast.success("Link copiado com sucesso!");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = selfSignupUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      toast.success("Link copiado com sucesso!");
    }
  };

  const openPublicPage = () => {
    window.open(selfSignupUrl, "_blank", "noopener,noreferrer");
  };

  const printPoster = () => {
    window.print();
  };

  const printableChurchName = churchName?.trim() || "nossa igreja";

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setIsOpen(true)}>
        <QrCode className="mr-2 h-4 w-4" />
        Compartilhar Auto Cadastro
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Auto cadastro da igreja</AlertDialogTitle>
            <AlertDialogDescription>
              Compartilhe o link ou QR Code para que novos membros facam o
              cadastro rapidamente.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Link publico
              </p>
              <div className="flex gap-2">
                <Input value={selfSignupUrl} readOnly className="text-xs" />
                <Button type="button" variant="outline" onClick={copyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex justify-center">
                <QRCodeSVG
                  value={selfSignupUrl}
                  size={180}
                  bgColor="transparent"
                  fgColor="currentColor"
                  className="text-foreground"
                />
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel type="button">Fechar</AlertDialogCancel>
            <AlertDialogAction type="button" onClick={printPoster}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </AlertDialogAction>
            <AlertDialogAction type="button" onClick={openPublicPage}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir pagina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="self-signup-print-shell hidden print:block">
        <div className="w-full max-w-xl rounded-2xl border border-black/20 bg-white p-10 text-black">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-black/10">
            <LinkIcon className="h-6 w-6" />
          </div>
          <h1 className="text-center font-heading text-3xl font-bold">
            Cadastro de novos membros
          </h1>
          <p className="mt-4 text-center text-base leading-relaxed">
            Escaneie o QR Code para abrir o formulario de cadastro da{" "}
            {printableChurchName}.
          </p>

          <div className="my-8 flex justify-center">
            <div className="rounded-xl border border-black/15 p-5">
              <QRCodeSVG value={selfSignupUrl} size={240} bgColor="#ffffff" />
            </div>
          </div>

          <p className="text-center text-sm">Ou acesse pelo link:</p>
          <p className="mt-2 break-all text-center text-sm font-semibold">
            {selfSignupUrl}
          </p>

          <p className="mt-8 text-center text-xs text-black/70">
            Central Connect - onboarding rapido para sua comunidade.
          </p>
        </div>
      </div>
    </>
  );
}
