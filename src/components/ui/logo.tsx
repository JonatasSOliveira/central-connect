import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
  priority?: boolean;
}

export function Logo({
  variant = "dark",
  className,
  priority = false,
}: LogoProps) {
  return (
    <Image
      src="/logo-central-redonda.svg"
      alt="Central Connect"
      width={112}
      height={112}
      priority={priority}
      className={cn("object-contain", variant === "dark" && "brightness-0", className)}
    />
  );
}
