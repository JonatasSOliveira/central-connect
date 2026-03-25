interface ChipGroupProps {
  children: React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

export function ChipGroup({
  children,
  emptyMessage,
  className = "",
}: ChipGroupProps) {
  const hasChildren = Boolean(children);

  if (!hasChildren && emptyMessage) {
    return (
      <p className={`text-sm text-muted-foreground ${className}`}>
        {emptyMessage}
      </p>
    );
  }

  if (!hasChildren) {
    return null;
  }

  return <div className={`flex flex-wrap gap-2 ${className}`}>{children}</div>;
}
