import { and, eq, inArray, isNull } from "drizzle-orm";
import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import {
  memberAvailabilities,
  memberChurches,
  memberMinistries,
  memberMinistryRoles,
  members,
} from "@/infra/database/drizzle/schema";
import type {
  IScaleGenerationCandidateReader,
  FindScaleGenerationCandidatesInput,
} from "@/modules/scales/application/ports/generation/IScaleGenerationCandidateReader";
import type { ScaleGenerationCandidateContext } from "@/modules/scales/application/ports/generation/IScaleGenerationContextReader";
import type { DayOfWeek } from "@/shared/domain/entities/DayOfWeek";

export class ScaleGenerationCandidateDrizzleReader
  implements IScaleGenerationCandidateReader
{
  constructor(private readonly database: DatabaseExecutor) {}

  async findCandidates(
    input: FindScaleGenerationCandidatesInput,
  ): Promise<ScaleGenerationCandidateContext[]> {
    const ministryIds = [...new Set(input.ministryIds)];
    const roleIds = [...new Set(input.roleIds)];
    if (ministryIds.length === 0 || roleIds.length === 0) return [];

    const rows = await this.database
      .select({
        memberId: members.id,
        fullName: members.fullName,
        roleId: memberMinistryRoles.ministryRoleId,
        availableDays: memberAvailabilities.daysOfWeek,
      })
      .from(memberChurches)
      .innerJoin(members, eq(members.id, memberChurches.memberId))
      .innerJoin(
        memberMinistries,
        and(
          eq(memberMinistries.memberId, memberChurches.memberId),
          eq(memberMinistries.churchId, input.churchId),
          inArray(memberMinistries.ministryId, ministryIds),
          isNull(memberMinistries.deletedAt),
        ),
      )
      .innerJoin(
        memberMinistryRoles,
        and(
          eq(memberMinistryRoles.memberId, memberChurches.memberId),
          eq(memberMinistryRoles.ministryId, memberMinistries.ministryId),
          eq(memberMinistryRoles.churchId, input.churchId),
          inArray(memberMinistryRoles.ministryRoleId, roleIds),
          isNull(memberMinistryRoles.deletedAt),
        ),
      )
      .leftJoin(
        memberAvailabilities,
        and(
          eq(memberAvailabilities.memberId, memberChurches.memberId),
          isNull(memberAvailabilities.deletedAt),
        ),
      )
      .where(
        and(
          eq(memberChurches.churchId, input.churchId),
          eq(members.status, "Active"),
          isNull(memberChurches.deletedAt),
          isNull(members.deletedAt),
        ),
      );

    const byMember = new Map<string, ScaleGenerationCandidateContext>();
    for (const row of rows) {
      const availableDays = parseDays(row.availableDays);
      if (
        !input.includeUnavailable &&
        availableDays &&
        !availableDays.includes(input.serviceDayOfWeek)
      ) {
        continue;
      }
      const candidate = byMember.get(row.memberId) ?? {
        memberId: row.memberId,
        fullName: row.fullName,
        authorizedRoleIds: [],
        availableDays,
        participationHistory: [],
      };
      if (!candidate.authorizedRoleIds.includes(row.roleId)) {
        candidate.authorizedRoleIds.push(row.roleId);
      }
      byMember.set(row.memberId, candidate);
    }
    return [...byMember.values()];
  }
}

function parseDays(value: unknown): DayOfWeek[] | null {
  if (!Array.isArray(value)) return null;
  const validDays = new Set<DayOfWeek>([
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]);
  const days = value.filter(
    (day): day is DayOfWeek => typeof day === "string" && validDays.has(day as DayOfWeek),
  );
  return days.length > 0 ? days : null;
}
