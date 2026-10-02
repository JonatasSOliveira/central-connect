"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface GeneratedImage {
  file: File;
  url: string;
}

export function useShareScaleImage() {
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    return () => {
      if (generatedImage) URL.revokeObjectURL(generatedImage.url);
    };
  }, [generatedImage]);

  const clearPreview = useCallback(() => {
    setGeneratedImage((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }, []);

  const generateScaleImage = useCallback(async (scaleId: string) => {
    setIsGenerating(true);
    clearPreview();
    try {
      const response = await fetch(`/api/scales/${scaleId}/share-image`, {
        method: "POST",
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(data?.error?.message ?? "Não foi possível gerar a imagem da escala.");
      }

      const blob = await response.blob();
      const fileName = response.headers
        .get("content-disposition")
        ?.match(/filename="?([^";]+)"?/i)?.[1] ?? `escala-${scaleId}.png`;
      const file = new File([blob], fileName, { type: "image/png" });
      setGeneratedImage({ file, url: URL.createObjectURL(file) });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível gerar a imagem da escala.");
    } finally {
      setIsGenerating(false);
    }
  }, [clearPreview]);

  const shareImage = useCallback(async () => {
    if (!generatedImage) return;
    try {
      if (navigator.share && navigator.canShare?.({ files: [generatedImage.file] })) {
        await navigator.share({
          title: "Escala publicada",
          text: "Escala publicada",
          files: [generatedImage.file],
        });
        toast.success("Imagem da escala compartilhada.");
        return;
      }
      downloadImage(generatedImage);
      toast.success("Imagem baixada. Você pode enviá-la pelo WhatsApp.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Não foi possível compartilhar a imagem da escala.");
    }
  }, [generatedImage]);

  const downloadGeneratedImage = useCallback(() => {
    if (!generatedImage) return;
    downloadImage(generatedImage);
    toast.success("Imagem da escala baixada.");
  }, [generatedImage]);

  return {
    generatedImage,
    isGenerating,
    generateScaleImage,
    shareImage,
    downloadGeneratedImage,
    clearPreview,
  };
}

function downloadImage(image: GeneratedImage): void {
  const anchor = document.createElement("a");
  anchor.href = image.url;
  anchor.download = image.file.name;
  anchor.click();
}
