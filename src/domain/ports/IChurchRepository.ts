import type { Church } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IChurchRepository extends BaseRepository<Church> {
  findByIds(ids: string[]): Promise<Church[]>;
}
