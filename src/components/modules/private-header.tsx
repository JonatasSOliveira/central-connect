"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn, getContrastColor } from "@/lib/utils";

interface PrivateHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backHref?: string;
  bgColor?: string;
  action?: ReactNode;
}

export function PrivateHeader({
  title,
  subtitle,
  showBackButton = true,
  backHref = "/home",
  bgColor,
  action,
}: PrivateHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push(backHref);
  };

  const textColor = bgColor ? getContrastColor(bgColor) : null;
  const bgStyle = bgColor ? { backgroundColor: bgColor } : undefined;
  const textClass = textColor === "white" ? "text-white" : "text-foreground";
  const mutedTextClass =
    textColor === "white" ? "text-white/80" : "text-muted-foreground";
  const hoverClass = bgColor
    ? textColor === "white"
      ? "hover:bg-white/20"
      : "hover:bg-muted"
    : "";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex h-16 items-center border-b border-border bg-background/95 px-4 text-foreground shadow-[var(--shadow-soft-sm)] backdrop-blur",
        bgColor && "text-current",
      )}
      style={bgStyle}
    >
      <div className="flex items-center gap-3 w-full">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            className={`-ml-2 h-9 w-auto min-w-9 px-2 cursor-pointer ${bgColor ? `${textClass} ${hoverClass}` : ""}`}
            onClick={handleBack}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}

        <div className="flex-1 min-w-0">
          <h1
            className={`font-heading text-lg font-bold truncate ${bgColor ? textClass : ""}`}
          >
            {title}
          </h1>
          {subtitle && (
            <p className={`text-xs truncate ${bgColor ? mutedTextClass : ""}`}>
              {subtitle}
            </p>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
