import type { Scale } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IScaleRepository extends BaseRepository<Scale> {
  findAll(): Promise<Scale[]>;
  findByChurchId(churchId: string): Promise<Scale[]>;
  findById(id: string): Promise<Scale | null>;
  findByServiceAndMinistry(
    churchId: string,
    serviceId: string,
    ministryId: string,
    excludeId?: string,
  ): Promise<Scale | null>;
  findByFilters(
    churchId: string,
    filters: { serviceId?: string; ministryId?: string },
  ): Promise<Scale[]>;
}
