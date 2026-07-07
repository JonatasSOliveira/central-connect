"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MutiraoAvailability } from "@/domain/enums/MutiraoAvailability";
import { PracticalSkill } from "@/domain/enums/PracticalSkill";
import {
  mutiraoAvailabilityLabels,
  practicalSkillLabels,
} from "@/features/self-signup/constants/practicalSkillLabels";
import type { SelfSignupMemberFormState } from "@/features/self-signup/hooks/selfSignupMemberFormState";

interface SelfSignupProfessionalProfileStepProps {
  data: SelfSignupMemberFormState["professionalProfile"];
  onChange: (
    value: Partial<SelfSignupMemberFormState["professionalProfile"]>,
  ) => void;
  onTogglePracticalSkill: (skill: string) => void;
}

const mutiraoOptions = Object.values(MutiraoAvailability).map((value) => ({
  value,
  label: mutiraoAvailabilityLabels[value],
}));

function BooleanChoice({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`h-11 rounded-lg border text-sm ${
            value === true
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card"
          }`}
        >
          Sim
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`h-11 rounded-lg border text-sm ${
            value === false
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card"
          }`}
        >
          Não
        </button>
      </div>
    </div>
  );
}

export function SelfSignupProfessionalProfileStep({
  data,
  onChange,
  onTogglePracticalSkill,
}: SelfSignupProfessionalProfileStepProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="currentProfession">Profissão atual *</Label>
        <Input
          id="currentProfession"
          value={data.currentProfession}
          onChange={(event) =>
            onChange({ currentProfession: event.target.value })
          }
          placeholder="Sua profissao"
        />
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-3">
        <p className="text-sm font-medium">Habilidades para servir</p>
        {Object.values(PracticalSkill).map((skill) => (
          <label key={skill} className="flex items-start gap-2">
            <Checkbox
              checked={data.skills.includes(skill)}
              onCheckedChange={() => onTogglePracticalSkill(skill)}
            />
            <span className="text-sm leading-5">
              {practicalSkillLabels[skill]}
            </span>
          </label>
        ))}
      </div>

      {data.skills.includes(PracticalSkill.Driving) ? (
        <div className="space-y-3">
          <BooleanChoice
            label="Tem CNH? *"
            value={data.hasDriverLicense}
            onChange={(value) => onChange({ hasDriverLicense: value })}
          />
          <BooleanChoice
            label="Tem veículo próprio? *"
            value={data.hasOwnVehicle}
            onChange={(value) => onChange({ hasOwnVehicle: value })}
          />
        </div>
      ) : null}

      {data.skills.includes(PracticalSkill.TranslationLanguages) ? (
        <div className="space-y-1.5">
          <Label htmlFor="languages">Quais idiomas? *</Label>
          <Input
            id="languages"
            value={data.languages}
            onChange={(event) => onChange({ languages: event.target.value })}
            placeholder="Ex: Inglês, espanhol"
          />
        </div>
      ) : null}

      {data.skills.includes(PracticalSkill.Other) ? (
        <div className="space-y-1.5">
          <Label htmlFor="otherSkill">Outra habilidade *</Label>
          <Input
            id="otherSkill"
            value={data.otherSkill}
            onChange={(event) => onChange({ otherSkill: event.target.value })}
            placeholder="Descreva a habilidade"
          />
        </div>
      ) : null}

      <FormSelect
        label="Disponibilidade para mutirões"
        value={data.mutiraoAvailability}
        onChange={(value) => onChange({ mutiraoAvailability: value })}
        options={mutiraoOptions}
        required
      />
    </div>
  );
}
