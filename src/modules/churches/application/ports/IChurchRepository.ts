import type { Church } from "@/modules/churches/domain/entities/Church";
import type { BaseRepository } from "@/shared/domain/ports/BaseRepository";

export interface IChurchRepository extends BaseRepository<Church> {
  findByIds(ids: string[]): Promise<Church[]>;
}
