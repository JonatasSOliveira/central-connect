import { cn } from "@/lib/utils";

export function DateTile({
  date,
  time,
  className,
}: {
  date: Date | string;
  time?: string;
  className?: string;
}) {
  const parsedDate = new Date(date);
  const month = parsedDate.toLocaleDateString("pt-BR", { month: "short" });

  return (
    <div
      className={cn(
        "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary",
        className,
      )}
    >
      <span className="text-[10px] font-bold uppercase leading-none">{month}</span>
      <span className="mt-1 font-heading text-xl font-bold leading-none">
        {parsedDate.getDate()}
      </span>
      {time && <span className="mt-1 text-[10px] font-semibold leading-none">{time}</span>}
    </div>
  );
}
