"use client";

import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberStepper } from "@/components/ui/number-stepper";
import { PhoneInput } from "@/components/ui/phone-input";
import { MaritalStatus } from "@/domain/enums/MaritalStatus";
import { maritalStatusLabels } from "@/features/self-signup/constants/maritalStatusLabels";
import type { SelfSignupMemberFormState } from "@/features/self-signup/hooks/selfSignupMemberFormState";

interface SelfSignupBasicDataStepProps {
  fullName: string;
  phone: string;
  data: SelfSignupMemberFormState["basicData"];
  onFullNameChange: (value: string) => void;
  onChange: (value: Partial<SelfSignupMemberFormState["basicData"]>) => void;
}

const maritalStatusOptions = Object.values(MaritalStatus).map((value) => ({
  value,
  label: maritalStatusLabels[value],
}));

export function SelfSignupBasicDataStep({
  fullName,
  phone,
  data,
  onFullNameChange,
  onChange,
}: SelfSignupBasicDataStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Nome completo *</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(event) => onFullNameChange(event.target.value)}
          placeholder="Seu nome completo"
          autoComplete="name"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phoneReadOnly">WhatsApp / Telefone *</Label>
        <PhoneInput id="phoneReadOnly" value={phone} readOnly />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="birthDate">Data de nascimento *</Label>
        <Input
          id="birthDate"
          type="date"
          value={data.birthDate}
          onChange={(event) => onChange({ birthDate: event.target.value })}
        />
      </div>

      <FormSelect
        label="Estado civil"
        value={data.maritalStatus}
        onChange={(value) => onChange({ maritalStatus: value })}
        options={maritalStatusOptions}
        required
      />

      <div className="space-y-2">
        <Label>Tem filhos? *</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ hasChildren: true })}
            className={`h-11 rounded-lg border text-sm ${
              data.hasChildren
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card"
            }`}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({
                hasChildren: false,
                childrenCount: null,
                childrenAges: "",
              })
            }
            className={`h-11 rounded-lg border text-sm ${
              !data.hasChildren
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card"
            }`}
          >
            Não
          </button>
        </div>
      </div>

      {data.hasChildren ? (
        <>
          <NumberStepper
            label="Quantidade de filhos *"
            min={1}
            value={data.childrenCount ?? 1}
            onChange={(value) => onChange({ childrenCount: value })}
          />
          <div className="space-y-1.5">
            <Label htmlFor="childrenAges">Idades dos filhos</Label>
            <Input
              id="childrenAges"
              value={data.childrenAges}
              onChange={(event) =>
                onChange({ childrenAges: event.target.value })
              }
              placeholder="Ex: 4, 8 e 12 anos"
            />
          </div>
        </>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="neighborhood">Bairro onde mora *</Label>
        <Input
          id="neighborhood"
          value={data.neighborhood}
          onChange={(event) => onChange({ neighborhood: event.target.value })}
          placeholder="Seu bairro"
        />
      </div>
    </div>
  );
}
