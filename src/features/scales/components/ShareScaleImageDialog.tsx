"use client";

import { Download, Image as ImageIcon, Loader2, Share2, X } from "lucide-react";
import NextImage from "next/image";
import { useEffect } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useShareScaleImage } from "../hooks/useShareScaleImage";

interface ShareScaleImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scaleId: string;
}

export function ShareScaleImageDialog({
  open,
  onOpenChange,
  scaleId,
}: ShareScaleImageDialogProps) {
  const {
    generatedImage,
    isGenerating,
    generateScaleImage,
    shareImage,
    downloadGeneratedImage,
    clearPreview,
  } = useShareScaleImage();

  useEffect(() => {
    if (open) void generateScaleImage(scaleId);
    else clearPreview();
  }, [clearPreview, generateScaleImage, open, scaleId]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) clearPreview();
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="relative max-w-lg gap-4 sm:max-w-lg">
        <DialogClose
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 z-10"
          aria-label="Fechar modal de compartilhamento"
        >
          <X aria-hidden="true" />
        </DialogClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="size-5 text-primary" aria-hidden="true" />
            Compartilhar escala publicada
          </DialogTitle>
          <DialogDescription>
            Confira a imagem oficial antes de enviar aos participantes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-48 max-h-[58vh] items-center justify-center overflow-auto rounded-xl border border-border bg-background p-3 sm:min-h-64">
          {isGenerating && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              Gerando imagem oficial...
            </div>
          )}
          {!isGenerating && generatedImage && (
            <NextImage
              src={generatedImage.url}
              alt="Prévia da escala publicada"
              width={540}
              height={900}
              unoptimized
              className="h-auto w-full max-w-md rounded-lg"
            />
          )}
          {!isGenerating && !generatedImage && (
            <p className="text-center text-sm text-muted-foreground">
              Não foi possível carregar a prévia.
            </p>
          )}
        </div>

        <DialogFooter className="-mx-4 -mb-4 px-4 pb-4 sm:-mx-6 sm:-mb-6 sm:px-6 sm:pb-6">
          <DialogClose disabled={isGenerating} className="w-full sm:w-auto">
            <X aria-hidden="true" />
            Fechar
          </DialogClose>
          {generatedImage && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={downloadGeneratedImage}
              >
                <Download aria-hidden="true" />
                Baixar
              </Button>
              <Button type="button" className="w-full sm:w-auto" onClick={shareImage}>
                <Share2 aria-hidden="true" />
                Compartilhar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
