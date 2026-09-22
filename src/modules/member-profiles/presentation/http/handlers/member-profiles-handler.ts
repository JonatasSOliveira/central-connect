import { type NextRequest, NextResponse } from "next/server";
import { getChurchIdFromSession } from "@/app/api/_lib/auth";
import { canReadMemberProfiles } from "@/app/api/member-profiles/_lib/canReadMemberProfiles";
import type { ListMemberProfiles } from "@/modules/member-profiles/application/use-cases/ListMemberProfiles";
import type { AuthResult } from "@/shared/contracts/auth";
import { AcceptedJesusStatus } from "@/shared/domain/enums/AcceptedJesusStatus";
import { ChurchAttendanceTime } from "@/shared/domain/enums/ChurchAttendanceTime";
import { DiscipleshipStatus } from "@/shared/domain/enums/DiscipleshipStatus";
import { MaritalStatus } from "@/shared/domain/enums/MaritalStatus";
import { MutiraoAvailability } from "@/shared/domain/enums/MutiraoAvailability";
import { OfficialMemberStatus } from "@/shared/domain/enums/OfficialMemberStatus";
import { PracticalSkill } from "@/shared/domain/enums/PracticalSkill";
import { ServiceAvailabilitySlot } from "@/shared/domain/enums/ServiceAvailabilitySlot";
import { SmallGroupStatus } from "@/shared/domain/enums/SmallGroupStatus";
import { WaterBaptismStatus } from "@/shared/domain/enums/WaterBaptismStatus";
import { getHttpStatus } from "@/shared/utils/apiResponse";

interface UseCases {
  listMemberProfiles: ListMemberProfiles;
}
function values<T extends Record<string, string>>(
  params: URLSearchParams,
  key: string,
  enumeration: T,
): T[keyof T][] | undefined {
  const valid = new Set(Object.values(enumeration));
  const result = params
    .getAll(key)
    .filter((value): value is T[keyof T] => valid.has(value));
  return result.length ? result : undefined;
}
function strings(params: URLSearchParams, key: string) {
  const result = params.getAll(key).filter(Boolean);
  return result.length ? result : undefined;
}
function booleanValue(params: URLSearchParams, key: string) {
  const value = params.get(key);
  return value === "true" ? true : value === "false" ? false : undefined;
}

export function createMemberProfilesHandler(
  useCases: UseCases,
  validateSession: () => Promise<AuthResult>,
) {
  return async (request: NextRequest) => {
    const auth = await validateSession();
    if (!auth.ok) return NextResponse.json(auth, { status: 401 });
    const params = new URL(request.url).searchParams;
    const churchId = getChurchIdFromSession(auth.user, params.get("churchId"));
    if (!churchId)
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NO_CHURCH_SELECTED",
            message: "Nenhuma igreja selecionada",
          },
        },
        { status: 400 },
      );
    if (!canReadMemberProfiles(auth.user, churchId))
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_AUTHORIZED",
            message: "Sem permissao para acessar perfis desta igreja",
          },
        },
        { status: 403 },
      );
    const result = await useCases.listMemberProfiles.execute({
      churchId,
      filters: {
        practicalSkills: values(params, "practicalSkills", PracticalSkill),
        acceptedJesus: values(params, "acceptedJesus", AcceptedJesusStatus),
        waterBaptized: values(params, "waterBaptized", WaterBaptismStatus),
        maritalStatus: values(params, "maritalStatus", MaritalStatus),
        currentMinistryIds: strings(params, "currentMinistryIds"),
        desiredMinistryIds: strings(params, "desiredMinistryIds"),
        availabilitySlots: values(
          params,
          "availabilitySlots",
          ServiceAvailabilitySlot,
        ),
        discipleshipStatus: values(
          params,
          "discipleshipStatus",
          DiscipleshipStatus,
        ),
        smallGroupStatus: values(params, "smallGroupStatus", SmallGroupStatus),
        churchAttendanceTime: values(
          params,
          "churchAttendanceTime",
          ChurchAttendanceTime,
        ),
        officialMemberStatus: values(
          params,
          "officialMemberStatus",
          OfficialMemberStatus,
        ),
        hasChildren: booleanValue(params, "hasChildren"),
        hasDriverLicense: booleanValue(params, "hasDriverLicense"),
        hasOwnVehicle: booleanValue(params, "hasOwnVehicle"),
        mutiraoAvailability: values(
          params,
          "mutiraoAvailability",
          MutiraoAvailability,
        ),
      },
    });
    return NextResponse.json(result, {
      status: result.ok ? 200 : getHttpStatus(result.error?.code),
    });
  };
}
