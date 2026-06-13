import type { MemberFinalNotes } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IMemberFinalNotesRepository
  extends BaseRepository<MemberFinalNotes> {
  upsertByMemberAndChurch(
    finalNotes: MemberFinalNotes,
  ): Promise<MemberFinalNotes>;
}
