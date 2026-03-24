"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface PrivateHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backHref?: string;
}

export function PrivateHeader({
  title,
  subtitle,
  showBackButton = true,
  backHref = "/home",
}: PrivateHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push(backHref);
  };

  return (
    <header className="pt-2 pb-2">
      {showBackButton && (
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 h-9 w-auto min-w-9 px-3 text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={handleBack}
        >
          <ChevronLeft className="w-5 h-5" /> Voltar
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
