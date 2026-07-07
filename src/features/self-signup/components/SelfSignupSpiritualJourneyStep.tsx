"use client";

import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AcceptedJesusStatus } from "@/domain/enums/AcceptedJesusStatus";
import { ChurchAttendanceTime } from "@/domain/enums/ChurchAttendanceTime";
import { DiscipleshipStatus } from "@/domain/enums/DiscipleshipStatus";
import { OfficialMemberStatus } from "@/domain/enums/OfficialMemberStatus";
import { SmallGroupStatus } from "@/domain/enums/SmallGroupStatus";
import { WaterBaptismStatus } from "@/domain/enums/WaterBaptismStatus";
import {
  acceptedJesusStatusLabels,
  churchAttendanceTimeLabels,
  discipleshipStatusLabels,
  officialMemberStatusLabels,
  smallGroupStatusLabels,
  waterBaptismStatusLabels,
} from "@/features/self-signup/constants/spiritualJourneyLabels";
import type { SelfSignupMemberFormState } from "@/features/self-signup/hooks/selfSignupMemberFormState";

interface SelfSignupSpiritualJourneyStepProps {
  data: SelfSignupMemberFormState["spiritualJourney"];
  onChange: (
    value: Partial<SelfSignupMemberFormState["spiritualJourney"]>,
  ) => void;
}

function options<T extends string>(
  values: T[],
  labels: Record<T, string>,
): { value: string; label: string }[] {
  return values.map((value) => ({ value, label: labels[value] }));
}

export function SelfSignupSpiritualJourneyStep({
  data,
  onChange,
}: SelfSignupSpiritualJourneyStepProps) {
  return (
    <div className="space-y-4">
      <FormSelect
        label="Você já entregou sua vida a Jesus?"
        value={data.acceptedJesus}
        onChange={(value) => onChange({ acceptedJesus: value })}
        options={options(
          Object.values(AcceptedJesusStatus),
          acceptedJesusStatusLabels,
        )}
        required
      />

      <FormSelect
        label="Você é batizado nas águas?"
        value={data.waterBaptized}
        onChange={(value) => onChange({ waterBaptized: value })}
        options={options(
          Object.values(WaterBaptismStatus),
          waterBaptismStatusLabels,
        )}
        required
      />

      {data.waterBaptized === WaterBaptismStatus.Yes ? (
        <div className="space-y-1.5">
          <Label htmlFor="baptismDetails">Ano e igreja do batismo *</Label>
          <Input
            id="baptismDetails"
            value={data.baptismDetails}
            onChange={(event) =>
              onChange({ baptismDetails: event.target.value })
            }
            placeholder="Ex: 2020, Igreja Central"
          />
        </div>
      ) : null}

      <FormSelect
        label="Já passou por consolidação/discipulado?"
        value={data.discipleshipStatus}
        onChange={(value) => onChange({ discipleshipStatus: value })}
        options={options(
          Object.values(DiscipleshipStatus),
          discipleshipStatusLabels,
        )}
        required
      />

      <FormSelect
        label="Frequenta a igreja há quanto tempo?"
        value={data.churchAttendanceTime}
        onChange={(value) => onChange({ churchAttendanceTime: value })}
        options={options(
          Object.values(ChurchAttendanceTime),
          churchAttendanceTimeLabels,
        )}
        required
      />

      <FormSelect
        label="Participa de pequeno grupo / celula?"
        value={data.smallGroupStatus}
        onChange={(value) => onChange({ smallGroupStatus: value })}
        options={options(
          Object.values(SmallGroupStatus),
          smallGroupStatusLabels,
        )}
        required
      />

      <FormSelect
        label="Já é membro oficial da igreja?"
        value={data.officialMemberStatus}
        onChange={(value) => onChange({ officialMemberStatus: value })}
        options={options(
          Object.values(OfficialMemberStatus),
          officialMemberStatusLabels,
        )}
        required
      />
    </div>
  );
}
