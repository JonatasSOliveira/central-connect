interface MemberProfileFieldProps {
  label: string;
  value: React.ReactNode;
}

export function MemberProfileField({ label, value }: MemberProfileFieldProps) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 text-sm font-medium text-foreground">
        {value || "Nao informado"}
      </div>
    </div>
  );
}
