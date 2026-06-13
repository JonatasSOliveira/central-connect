import type { MemberProfessionalProfile } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IMemberProfessionalProfileRepository
  extends BaseRepository<MemberProfessionalProfile> {
  upsertByMemberAndChurch(
    professionalProfile: MemberProfessionalProfile,
  ): Promise<MemberProfessionalProfile>;
}
