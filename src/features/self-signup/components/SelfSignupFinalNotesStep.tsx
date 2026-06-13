"use client";

import { Label } from "@/components/ui/label";
import type { SelfSignupMemberFormState } from "@/features/self-signup/hooks/selfSignupMemberFormState";

interface SelfSignupFinalNotesStepProps {
  data: SelfSignupMemberFormState["finalNotes"];
  onChange: (value: Partial<SelfSignupMemberFormState["finalNotes"]>) => void;
}

export function SelfSignupFinalNotesStep({
  data,
  onChange,
}: SelfSignupFinalNotesStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="healthLimitations">Limitação física ou de saúde</Label>
        <textarea
          id="healthLimitations"
          value={data.healthLimitations}
          onChange={(event) =>
            onChange({ healthLimitations: event.target.value })
          }
          rows={4}
          className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Opcional"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="leadershipNotes">
          Algo mais para compartilhar com a liderança
        </Label>
        <textarea
          id="leadershipNotes"
          value={data.leadershipNotes}
          onChange={(event) =>
            onChange({ leadershipNotes: event.target.value })
          }
          rows={4}
          className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Opcional"
        />
      </div>

      <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
        Revise seus dados antes de continuar para o aceite dos termos e login
        com Google.
      </div>
    </div>
  );
}
