"use client";

import { ChevronDown, RotateCcw } from "lucide-react";
import type {
  MemberProfileFilters as Filters,
  MemberProfileFilterOptionsDTO,
} from "@/application/dtos/member-profile/MemberProfileDTO";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { AcceptedJesusStatus } from "@/domain/enums/AcceptedJesusStatus";
import { ChurchAttendanceTime } from "@/domain/enums/ChurchAttendanceTime";
import { DiscipleshipStatus } from "@/domain/enums/DiscipleshipStatus";
import { MaritalStatus } from "@/domain/enums/MaritalStatus";
import { MutiraoAvailability } from "@/domain/enums/MutiraoAvailability";
import { OfficialMemberStatus } from "@/domain/enums/OfficialMemberStatus";
import { PracticalSkill } from "@/domain/enums/PracticalSkill";
import { ServiceAvailabilitySlot } from "@/domain/enums/ServiceAvailabilitySlot";
import { SmallGroupStatus } from "@/domain/enums/SmallGroupStatus";
import { WaterBaptismStatus } from "@/domain/enums/WaterBaptismStatus";
import { enumOptions } from "./MemberProfileFilterControls";
import { MemberProfileBooleanFilter } from "./MemberProfileBooleanFilter";
import { memberProfileLabels } from "./member-profile-labels";

interface MemberProfileFiltersProps {
  filters: Filters;
  filterOptions: MemberProfileFilterOptionsDTO;
  onChange: (filters: Filters) => void;
  onClear: () => void;
}

function compact<T extends string>(value: T[]): T[] | undefined {
  return value.length > 0 ? value : undefined;
}

export function MemberProfileFilters({
  filters,
  filterOptions,
  onChange,
  onClear,
}: MemberProfileFiltersProps) {
  return (
    <details className="rounded-lg border border-border bg-card p-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-base font-semibold">Filtros</h2>
          <p className="text-xs text-muted-foreground">
            Refina o dashboard e a listagem
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </summary>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <MultiSelect
          label="Habilidades"
          value={filters.practicalSkills ?? []}
          onChange={(value) =>
            onChange({ ...filters, practicalSkills: compact(value as PracticalSkill[]) })
          }
          options={enumOptions(PracticalSkill, memberProfileLabels.practicalSkills)}
          placeholder="Todas as habilidades"
        />
        <MultiSelect
          label="Ministerios atuais"
          value={filters.currentMinistryIds ?? []}
          onChange={(value) => onChange({ ...filters, currentMinistryIds: compact(value) })}
          options={filterOptions.ministries}
          placeholder="Todos os ministerios"
        />
        <MultiSelect
          label="Ministerios desejados"
          value={filters.desiredMinistryIds ?? []}
          onChange={(value) => onChange({ ...filters, desiredMinistryIds: compact(value) })}
          options={filterOptions.ministries}
          placeholder="Todos os ministerios"
        />
        <MultiSelect
          label="Aceitou Jesus"
          value={filters.acceptedJesus ?? []}
          onChange={(value) =>
            onChange({ ...filters, acceptedJesus: compact(value as AcceptedJesusStatus[]) })
          }
          options={enumOptions(AcceptedJesusStatus, memberProfileLabels.acceptedJesus)}
          placeholder="Todos"
        />
        <MultiSelect
          label="Batismo nas aguas"
          value={filters.waterBaptized ?? []}
          onChange={(value) =>
            onChange({ ...filters, waterBaptized: compact(value as WaterBaptismStatus[]) })
          }
          options={enumOptions(WaterBaptismStatus, memberProfileLabels.waterBaptized)}
          placeholder="Todos"
        />
        <MultiSelect
          label="Estado civil"
          value={filters.maritalStatus ?? []}
          onChange={(value) =>
            onChange({ ...filters, maritalStatus: compact(value as MaritalStatus[]) })
          }
          options={enumOptions(MaritalStatus, memberProfileLabels.maritalStatus)}
          placeholder="Todos"
        />
        <MultiSelect
          label="Disponibilidade"
          value={filters.availabilitySlots ?? []}
          onChange={(value) =>
            onChange({ ...filters, availabilitySlots: compact(value as ServiceAvailabilitySlot[]) })
          }
          options={enumOptions(ServiceAvailabilitySlot, memberProfileLabels.availabilitySlots)}
          placeholder="Todas"
        />
        <MultiSelect
          label="Discipulado"
          value={filters.discipleshipStatus ?? []}
          onChange={(value) =>
            onChange({ ...filters, discipleshipStatus: compact(value as DiscipleshipStatus[]) })
          }
          options={enumOptions(DiscipleshipStatus, memberProfileLabels.discipleshipStatus)}
          placeholder="Todos"
        />
        <MultiSelect
          label="Pequeno grupo"
          value={filters.smallGroupStatus ?? []}
          onChange={(value) =>
            onChange({ ...filters, smallGroupStatus: compact(value as SmallGroupStatus[]) })
          }
          options={enumOptions(SmallGroupStatus, memberProfileLabels.smallGroupStatus)}
          placeholder="Todos"
        />
        <MultiSelect
          label="Tempo de igreja"
          value={filters.churchAttendanceTime ?? []}
          onChange={(value) =>
            onChange({ ...filters, churchAttendanceTime: compact(value as ChurchAttendanceTime[]) })
          }
          options={enumOptions(ChurchAttendanceTime, memberProfileLabels.churchAttendanceTime)}
          placeholder="Todos"
        />
        <MultiSelect
          label="Membro oficial"
          value={filters.officialMemberStatus ?? []}
          onChange={(value) =>
            onChange({ ...filters, officialMemberStatus: compact(value as OfficialMemberStatus[]) })
          }
          options={enumOptions(OfficialMemberStatus, memberProfileLabels.officialMemberStatus)}
          placeholder="Todos"
        />
        <MultiSelect
          label="Mutirao"
          value={filters.mutiraoAvailability ?? []}
          onChange={(value) =>
            onChange({ ...filters, mutiraoAvailability: compact(value as MutiraoAvailability[]) })
          }
          options={enumOptions(MutiraoAvailability, memberProfileLabels.mutiraoAvailability)}
          placeholder="Todos"
        />
        <MemberProfileBooleanFilter
          label="Tem filhos"
          value={filters.hasChildren}
          onChange={(value) => onChange({ ...filters, hasChildren: value })}
        />
        <MemberProfileBooleanFilter
          label="CNH"
          value={filters.hasDriverLicense}
          onChange={(value) => onChange({ ...filters, hasDriverLicense: value })}
        />
        <MemberProfileBooleanFilter
          label="Veiculo proprio"
          value={filters.hasOwnVehicle}
          onChange={(value) => onChange({ ...filters, hasOwnVehicle: value })}
        />
        <div className="flex items-end">
          <Button type="button" variant="outline" onClick={onClear}>
            <RotateCcw className="h-4 w-4" />
            Limpar filtros
          </Button>
        </div>
      </div>
    </details>
  );
}
