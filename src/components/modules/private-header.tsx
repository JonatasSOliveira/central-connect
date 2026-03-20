"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface PrivateHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

export function PrivateHeader({
  title,
  subtitle,
  showBackButton = true,
}: PrivateHeaderProps) {
  const router = useRouter();

  return (
    <header className="pt-2 pb-4">
      {showBackButton && (
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 h-9 px-3 text-muted-foreground hover:text-foreground"
          onClick={() => router.back()}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
      )}

      <h1 className="font-heading text-2xl font-bold text-foreground">
        {title}
      </h1>

      {subtitle && (
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      )}
    </header>
  );
}
