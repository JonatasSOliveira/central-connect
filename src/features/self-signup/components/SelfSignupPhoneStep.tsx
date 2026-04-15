"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";

interface SelfSignupPhoneStepProps {
  phone: string;
  isLoading: boolean;
  onPhoneChange: (value: string) => void;
  onContinue: () => void;
}

export function SelfSignupPhoneStep({
  phone,
  isLoading,
  onPhoneChange,
  onContinue,
}: SelfSignupPhoneStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="phone">Telefone</Label>
        <PhoneInput
          id="phone"
          value={phone}
          onChangeValue={onPhoneChange}
          placeholder="(11) 99999-9999"
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          Vamos usar seu telefone para localizar um cadastro existente.
        </p>
      </div>

      <Button
        type="button"
        className="w-full"
        onClick={onContinue}
        disabled={isLoading}
      >
        {isLoading ? "Consultando..." : "Continuar"}
      </Button>
    </div>
  );
}
