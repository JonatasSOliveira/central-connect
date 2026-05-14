"use client";

import { ImageUp, Loader2, Share2 } from "lucide-react";
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
import { useShareScaleImage } from "../hooks/useShareScaleImage";

interface ShareScaleImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scaleId: string;
  churchId: string;
  churchName: string;
}

export function ShareScaleImageDialog({
  open,
  onOpenChange,
  scaleId,
  churchId,
  churchName,
}: ShareScaleImageDialogProps) {
  const { shareScaleImage } = useShareScaleImage();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShare = async () => {
    setIsGenerating(true);
    await shareScaleImage({ scaleId, churchId, churchName });
    setIsGenerating(false);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ImageUp className="h-5 w-5 text-primary" />
            Compartilhar escala publicada
          </AlertDialogTitle>
          <AlertDialogDescription>
            Vamos gerar uma imagem com os dados da escala, membros e funções.
            Depois disso, você poderá compartilhar no WhatsApp ou em outro app.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isGenerating}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleShare} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando imagem...
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Gerar e compartilhar
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
