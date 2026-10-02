import type { MemberMinistryRole } from "@/modules/members/domain/entities/MemberMinistryRole";
import type { BaseRepository } from "@/shared/domain/ports/BaseRepository";

export interface IMemberMinistryRoleRepository
  extends BaseRepository<MemberMinistryRole> {
  findByMemberAndMinistry(
    memberId: string,
    ministryId: string,
  ): Promise<MemberMinistryRole[]>;
  findByMemberId(memberId: string): Promise<MemberMinistryRole[]>;
  findByMinistryRoleId(ministryRoleId: string): Promise<MemberMinistryRole[]>;
  findByMinistryId(ministryId: string): Promise<MemberMinistryRole[]>;
  findByChurchIdAndMinistryId(
    churchId: string,
    ministryId: string,
  ): Promise<MemberMinistryRole[]>;
  findByChurchMemberAndMinistry(
    churchId: string,
    memberId: string,
    ministryId: string,
  ): Promise<MemberMinistryRole[]>;
  upsert(entity: MemberMinistryRole): Promise<MemberMinistryRole>;
}
