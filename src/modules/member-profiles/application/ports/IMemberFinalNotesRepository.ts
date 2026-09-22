import type { MemberFinalNotes } from "@/modules/member-profiles/domain/entities/MemberFinalNotes";
import type { BaseRepository } from "@/shared/domain/ports/BaseRepository";

export interface IMemberFinalNotesRepository
  extends BaseRepository<MemberFinalNotes> {
  findByMemberAndChurch(
    memberId: string,
    churchId: string,
  ): Promise<MemberFinalNotes | null>;
  findByChurchId(churchId: string): Promise<MemberFinalNotes[]>;
  upsertByMemberAndChurch(
    finalNotes: MemberFinalNotes,
  ): Promise<MemberFinalNotes>;
}
