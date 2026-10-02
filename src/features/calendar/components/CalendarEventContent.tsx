import { Clock3, MapPin } from "lucide-react";
import { formatServiceTime } from "@/features/services/utils/service-date";

interface CalendarEventContentProps {
  title: string;
  time: string;
  location: string | null;
  variant: "month" | "week" | "day" | "list";
}

export function CalendarEventContent({
  title,
  time,
  location,
  variant,
}: CalendarEventContentProps) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className={`flex items-center gap-1 font-bold ${variant === "month" ? "text-[0.7rem]" : "text-xs"}`}>
        <Clock3 className="size-3 shrink-0" aria-hidden="true" />
        {formatServiceTime(time)}
      </span>
      <span className={`truncate font-semibold ${variant === "month" ? "text-xs" : "text-sm"}`}>
        {title}
      </span>
      {location && variant !== "month" && (
        <span className="flex min-w-0 items-center gap-1 truncate text-xs font-medium opacity-90">
          <MapPin className="size-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{location}</span>
        </span>
      )}
    </div>
  );
}
