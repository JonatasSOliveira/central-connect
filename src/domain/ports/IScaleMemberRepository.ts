import type { ScaleMember } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IScaleMemberRepository extends BaseRepository<ScaleMember> {
  findAll(): Promise<ScaleMember[]>;
  findByScaleId(scaleId: string): Promise<ScaleMember[]>;
  findById(id: string): Promise<ScaleMember | null>;
  deleteByScaleId(scaleId: string): Promise<void>;
}
