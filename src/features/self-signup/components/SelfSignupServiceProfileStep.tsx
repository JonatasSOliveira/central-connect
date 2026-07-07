"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ServiceAvailabilitySlot } from "@/domain/enums/ServiceAvailabilitySlot";
import { serviceAvailabilityLabels } from "@/features/self-signup/constants/serviceAvailabilityLabels";
import type { SelfSignupMemberFormState } from "@/features/self-signup/hooks/selfSignupMemberFormState";

interface MinistryOption {
  id: string;
  name: string;
}

interface SelfSignupServiceProfileStepProps {
  data: SelfSignupMemberFormState["serviceProfile"];
  ministries: MinistryOption[];
  confirmNoMinistry: boolean;
  onChange: (
    value: Partial<SelfSignupMemberFormState["serviceProfile"]>,
  ) => void;
  onToggleMinistry: (ministryId: string) => void;
  onToggleDesiredMinistry: (ministryId: string) => void;
  onToggleAvailabilitySlot: (slot: string) => void;
  onConfirmNoMinistry: (value: boolean) => void;
}

function isInstrumentalMinistry(ministry: MinistryOption): boolean {
  return /instrument/i.test(
    ministry.name.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
  );
}

function hasInstrumentalSelected(
  data: SelfSignupMemberFormState["serviceProfile"],
  ministries: MinistryOption[],
): boolean {
  const selected = new Set([
    ...data.currentMinistryIds,
    ...data.desiredMinistryIds,
  ]);
  return ministries.some(
    (ministry) => selected.has(ministry.id) && isInstrumentalMinistry(ministry),
  );
}

export function SelfSignupServiceProfileStep({
  data,
  ministries,
  confirmNoMinistry,
  onChange,
  onToggleMinistry,
  onToggleDesiredMinistry,
  onToggleAvailabilitySlot,
  onConfirmNoMinistry,
}: SelfSignupServiceProfileStepProps) {
  const showInstrument = hasInstrumentalSelected(data, ministries);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Já serve em algum ministério hoje? *</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ currentlyServes: true })}
            className={`h-11 rounded-lg border text-sm ${
              data.currentlyServes
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card"
            }`}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() => onConfirmNoMinistry(true)}
            className={`h-11 rounded-lg border text-sm ${
              confirmNoMinistry
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card"
            }`}
          >
            Não
          </button>
        </div>
      </div>

      {data.currentlyServes && ministries.length > 0 ? (
        <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-sm font-medium">Ministérios em que serve hoje *</p>
          {ministries.map((ministry) => (
            <label key={ministry.id} className="flex items-start gap-2">
              <Checkbox
                checked={data.currentMinistryIds.includes(ministry.id)}
                onCheckedChange={() => onToggleMinistry(ministry.id)}
              />
              <span className="text-sm leading-5">{ministry.name}</span>
            </label>
          ))}
        </div>
      ) : null}

      {ministries.length > 0 ? (
        <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-sm font-medium">Ministérios que deseja servir</p>
          {ministries.map((ministry) => (
            <label key={ministry.id} className="flex items-start gap-2">
              <Checkbox
                checked={data.desiredMinistryIds.includes(ministry.id)}
                onCheckedChange={() => onToggleDesiredMinistry(ministry.id)}
              />
              <span className="text-sm leading-5">{ministry.name}</span>
            </label>
          ))}
          <Input
            value={data.otherDesiredMinistry}
            onChange={(event) =>
              onChange({ otherDesiredMinistry: event.target.value })
            }
            placeholder="Outro ministério"
          />
        </div>
      ) : null}

      {showInstrument ? (
        <div className="space-y-1.5">
          <Label htmlFor="instrument">Qual instrumento? *</Label>
          <Input
            id="instrument"
            value={data.instrumentalPraiseInstrument}
            onChange={(event) =>
              onChange({ instrumentalPraiseInstrument: event.target.value })
            }
            placeholder="Ex: Violão, teclado, bateria"
          />
        </div>
      ) : null}

      <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-3">
        <p className="text-sm font-medium">Dias de disponibilidade *</p>
        {Object.values(ServiceAvailabilitySlot).map((slot) => (
          <label key={slot} className="flex items-start gap-2">
            <Checkbox
              checked={data.availabilitySlots.includes(slot)}
              onCheckedChange={() => onToggleAvailabilitySlot(slot)}
            />
            <span className="text-sm leading-5">
              {serviceAvailabilityLabels[slot]}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
