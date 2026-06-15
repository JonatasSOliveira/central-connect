interface MemberProfileSectionProps {
  title: string;
  children: React.ReactNode;
}

export function MemberProfileSection({
  title,
  children,
}: MemberProfileSectionProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h2 className="font-heading text-base font-semibold text-foreground">
        {title}
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}
