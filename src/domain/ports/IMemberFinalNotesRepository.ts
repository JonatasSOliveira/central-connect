import type { MemberFinalNotes } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

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
