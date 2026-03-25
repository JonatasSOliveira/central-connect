import type { Ministry } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

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
