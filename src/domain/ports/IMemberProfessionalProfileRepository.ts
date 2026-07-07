import type { MemberProfessionalProfile } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

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
