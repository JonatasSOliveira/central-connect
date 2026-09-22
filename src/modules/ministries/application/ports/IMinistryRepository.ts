import type { Ministry } from "@/modules/ministries/domain/entities/Ministry";
import type { BaseRepository } from "@/shared/domain/ports/BaseRepository";

export interface IMinistryRepository extends BaseRepository<Ministry> {
  findAll(): Promise<Ministry[]>;
  findByChurchId(churchId: string): Promise<Ministry[]>;
  findById(id: string): Promise<Ministry | null>;
  findByChurchIdAndName(
    churchId: string,
    name: string,
    excludeId?: string,
  ): Promise<Ministry | null>;
}
