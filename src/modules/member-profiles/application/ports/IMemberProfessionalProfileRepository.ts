import type { MemberProfessionalProfile } from "@/modules/member-profiles/domain/entities/MemberProfessionalProfile";
import type { BaseRepository } from "@/shared/domain/ports/BaseRepository";

export interface IMemberProfessionalProfileRepository
  extends BaseRepository<MemberProfessionalProfile> {
  findByMemberAndChurch(
    memberId: string,
    churchId: string,
  ): Promise<MemberProfessionalProfile | null>;
  findByChurchId(churchId: string): Promise<MemberProfessionalProfile[]>;
  upsertByMemberAndChurch(
    professionalProfile: MemberProfessionalProfile,
  ): Promise<MemberProfessionalProfile>;
}
