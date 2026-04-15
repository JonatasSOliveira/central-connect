import { Card } from "@/components/ui/card";

interface SelfSignupPageProps {
  params: Promise<{ churchId: string }>;
}

export default async function SelfSignupPage({ params }: SelfSignupPageProps) {
  const { churchId } = await params;

  return (
    <div className="min-h-dvh px-4 py-8 bg-background">
      <div className="mx-auto w-full max-w-md">
        <Card className="border-primary/20 bg-card p-6 shadow-sm">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Self Signup
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Em breve voce podera se cadastrar para participar da escala desta
            igreja por aqui.
          </p>

          <div className="mt-6 rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Church ID</p>
            <p className="mt-1 break-all text-sm font-medium text-foreground">
              {churchId}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
