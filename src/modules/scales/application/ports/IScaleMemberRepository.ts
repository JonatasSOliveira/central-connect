import type { ScaleMember } from "@/modules/scales/domain/entities/ScaleMember";
import type { BaseRepository } from "@/shared/domain/ports/BaseRepository";

export interface IScaleMemberRepository extends BaseRepository<ScaleMember> {
  findAll(): Promise<ScaleMember[]>;
  findByMemberId(memberId: string): Promise<ScaleMember[]>;
  findByScaleId(scaleId: string): Promise<ScaleMember[]>;
  findByScaleIds(scaleIds: string[]): Promise<ScaleMember[]>;
  findById(id: string): Promise<ScaleMember | null>;
  deleteByScaleId(scaleId: string): Promise<void>;
}
