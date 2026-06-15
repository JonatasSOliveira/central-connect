import { type NextRequest, NextResponse } from "next/server";
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
import { memberProfileContainer } from "@/infra/di";
import { getHttpStatus } from "@/shared/utils/apiResponse";
import { getChurchIdFromSession, validateSession } from "../_lib/auth";
import { canReadMemberProfiles } from "./_lib/canReadMemberProfiles";

function getEnumValues<T extends Record<string, string>>(
  searchParams: URLSearchParams,
  key: string,
  enumValues: T,
): T[keyof T][] | undefined {
  const validValues = new Set(Object.values(enumValues));
  const values = searchParams
    .getAll(key)
    .filter((value): value is T[keyof T] => validValues.has(value));

  return values.length > 0 ? values : undefined;
}

function getStringValues(
  searchParams: URLSearchParams,
  key: string,
): string[] | undefined {
  const values = searchParams.getAll(key).filter(Boolean);
  return values.length > 0 ? values : undefined;
}

function getBooleanValue(
  searchParams: URLSearchParams,
  key: string,
): boolean | undefined {
  const value = searchParams.get(key);
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export async function GET(request: NextRequest) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const { searchParams } = new URL(request.url);
  const churchId = getChurchIdFromSession(user, searchParams.get("churchId"));

  if (!churchId) {
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
  }

  if (!canReadMemberProfiles(user, churchId)) {
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
  }

  const result = await memberProfileContainer.listMemberProfiles.execute({
    churchId,
    filters: {
      practicalSkills: getEnumValues(searchParams, "practicalSkills", PracticalSkill),
      acceptedJesus: getEnumValues(searchParams, "acceptedJesus", AcceptedJesusStatus),
      waterBaptized: getEnumValues(searchParams, "waterBaptized", WaterBaptismStatus),
      maritalStatus: getEnumValues(searchParams, "maritalStatus", MaritalStatus),
      currentMinistryIds: getStringValues(searchParams, "currentMinistryIds"),
      desiredMinistryIds: getStringValues(searchParams, "desiredMinistryIds"),
      availabilitySlots: getEnumValues(
        searchParams,
        "availabilitySlots",
        ServiceAvailabilitySlot,
      ),
      discipleshipStatus: getEnumValues(
        searchParams,
        "discipleshipStatus",
        DiscipleshipStatus,
      ),
      smallGroupStatus: getEnumValues(searchParams, "smallGroupStatus", SmallGroupStatus),
      churchAttendanceTime: getEnumValues(
        searchParams,
        "churchAttendanceTime",
        ChurchAttendanceTime,
      ),
      officialMemberStatus: getEnumValues(
        searchParams,
        "officialMemberStatus",
        OfficialMemberStatus,
      ),
      hasChildren: getBooleanValue(searchParams, "hasChildren"),
      hasDriverLicense: getBooleanValue(searchParams, "hasDriverLicense"),
      hasOwnVehicle: getBooleanValue(searchParams, "hasOwnVehicle"),
      mutiraoAvailability: getEnumValues(
        searchParams,
        "mutiraoAvailability",
        MutiraoAvailability,
      ),
    },
  });

  if (!result.ok) {
    return NextResponse.json(result, {
      status: getHttpStatus(result.error.code),
    });
  }

  return NextResponse.json(result, { status: 200 });
}
