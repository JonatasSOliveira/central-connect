import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FloatingActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className="fixed bottom-20 right-4 z-40 h-12 rounded-full px-4 shadow-lg sm:static"
    >
      <Plus className="mr-2 h-5 w-5" />
      {label}
    </Button>
  );
}
