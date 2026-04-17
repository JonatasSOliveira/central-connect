"use client";

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPhoneBrDynamic } from "@/shared/utils/phone";

interface SelfSignupFormStepProps {
  fullName: string;
  phone: string;
  onFullNameChange: (value: string) => void;
}

export function SelfSignupFormStep({
  fullName,
  phone,
  onFullNameChange,
}: SelfSignupFormStepProps) {
  const fullNameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fullNameRef.current?.focus();
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Nome completo</Label>
        <Input
          ref={fullNameRef}
          id="fullName"
          value={fullName}
          onChange={(event) => onFullNameChange(event.target.value)}
          placeholder="Seu nome completo"
          autoComplete="name"
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phoneReadOnly">Telefone</Label>
        <Input
          id="phoneReadOnly"
          value={formatPhoneBrDynamic(phone)}
          readOnly
        />
      </div>

      <p className="text-xs text-muted-foreground">
        O e-mail será obtido pela autenticação do Google na próxima etapa.
      </p>
    </div>
  );
}
