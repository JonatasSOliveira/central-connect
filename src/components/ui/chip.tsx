import { X } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onRemove?: () => void;
  variant?: "primary" | "secondary" | "muted";
}

export function Chip({
  children,
  onRemove,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: ChipProps) {
  const variantClasses = {
    primary: "bg-primary/10 text-primary hover:bg-primary/20",
    secondary:
      "bg-secondary/10 text-secondary-foreground hover:bg-secondary/20",
    muted: "bg-muted text-muted-foreground hover:bg-muted/80",
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${variantClasses[variant]} ${className}`}
    >
      <span className="truncate max-w-[120px]">{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="flex-shrink-0 rounded-full p-0.5 hover:bg-black/10 transition-colors disabled:opacity-50"
          {...props}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
