import type { Ministry } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IMinistryRepository extends BaseRepository<Ministry> {
  findByChurchId(churchId: string): Promise<Ministry[]>;
}
