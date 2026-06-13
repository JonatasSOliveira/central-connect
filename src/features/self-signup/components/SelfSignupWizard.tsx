"use client";

import { Button } from "@/components/ui/button";
import { SelfSignupBasicDataStep } from "@/features/self-signup/components/SelfSignupBasicDataStep";
import { SelfSignupFinalNotesStep } from "@/features/self-signup/components/SelfSignupFinalNotesStep";
import { SelfSignupProfessionalProfileStep } from "@/features/self-signup/components/SelfSignupProfessionalProfileStep";
import { SelfSignupProgress } from "@/features/self-signup/components/SelfSignupProgress";
import { SelfSignupServiceProfileStep } from "@/features/self-signup/components/SelfSignupServiceProfileStep";
import { SelfSignupSpiritualJourneyStep } from "@/features/self-signup/components/SelfSignupSpiritualJourneyStep";
import type { SelfSignupMemberFormState } from "@/features/self-signup/hooks/selfSignupMemberFormState";

interface MinistryOption {
  id: string;
  name: string;
}

interface SelfSignupWizardProps {
  currentStep: number;
  fullName: string;
  phone: string;
  memberForm: SelfSignupMemberFormState;
  ministries: MinistryOption[];
  confirmNoMinistry: boolean;
  onFullNameChange: (value: string) => void;
  onSectionChange: <TSection extends keyof SelfSignupMemberFormState>(
    section: TSection,
    value: Partial<SelfSignupMemberFormState[TSection]>,
  ) => void;
  onToggleMinistry: (ministryId: string) => void;
  onToggleDesiredMinistry: (ministryId: string) => void;
  onToggleAvailabilitySlot: (slot: string) => void;
  onTogglePracticalSkill: (skill: string) => void;
  onConfirmNoMinistry: (value: boolean) => void;
  onPrevious: () => void;
  onNext: () => boolean;
}

const stepTitles: Record<number, string> = {
  1: "Dados Básicos",
  2: "Vida Espiritual",
  3: "Ministérios e Servir",
  4: "Habilidades",
  5: "Observações Finais",
};

export function SelfSignupWizard({
  currentStep,
  fullName,
  phone,
  memberForm,
  ministries,
  confirmNoMinistry,
  onFullNameChange,
  onSectionChange,
  onToggleMinistry,
  onToggleDesiredMinistry,
  onToggleAvailabilitySlot,
  onTogglePracticalSkill,
  onConfirmNoMinistry,
  onPrevious,
  onNext,
}: SelfSignupWizardProps) {
  return (
    <div className="space-y-5">
      <SelfSignupProgress currentStep={currentStep} totalSteps={5} />
      <h2 className="font-heading text-lg font-semibold">
        {stepTitles[currentStep]}
      </h2>

      {currentStep === 1 ? (
        <SelfSignupBasicDataStep
          fullName={fullName}
          phone={phone}
          data={memberForm.basicData}
          onFullNameChange={onFullNameChange}
          onChange={(value) => onSectionChange("basicData", value)}
        />
      ) : null}

      {currentStep === 2 ? (
        <SelfSignupSpiritualJourneyStep
          data={memberForm.spiritualJourney}
          onChange={(value) => onSectionChange("spiritualJourney", value)}
        />
      ) : null}

      {currentStep === 3 ? (
        <SelfSignupServiceProfileStep
          data={memberForm.serviceProfile}
          ministries={ministries}
          confirmNoMinistry={confirmNoMinistry}
          onChange={(value) => onSectionChange("serviceProfile", value)}
          onToggleMinistry={onToggleMinistry}
          onToggleDesiredMinistry={onToggleDesiredMinistry}
          onToggleAvailabilitySlot={onToggleAvailabilitySlot}
          onConfirmNoMinistry={onConfirmNoMinistry}
        />
      ) : null}

      {currentStep === 4 ? (
        <SelfSignupProfessionalProfileStep
          data={memberForm.professionalProfile}
          onChange={(value) => onSectionChange("professionalProfile", value)}
          onTogglePracticalSkill={onTogglePracticalSkill}
        />
      ) : null}

      {currentStep === 5 ? (
        <SelfSignupFinalNotesStep
          data={memberForm.finalNotes}
          onChange={(value) => onSectionChange("finalNotes", value)}
        />
      ) : null}

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={currentStep === 1}
          className="flex-1"
        >
          Voltar
        </Button>
        {currentStep < 5 ? (
          <Button type="button" onClick={onNext} className="flex-1">
            Próxima
          </Button>
        ) : null}
      </div>
    </div>
  );
}
