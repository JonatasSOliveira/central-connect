import type { Service } from "@/modules/services/domain/entities/Service";
import type { BaseRepository } from "@/shared/domain/ports/BaseRepository";

export interface IServiceRepository extends BaseRepository<Service> {
  findByChurchId(churchId: string): Promise<Service[]>;
  findByDateRange(
    churchId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Service[]>;
  findByDateAndLocation(
    churchId: string,
    date: Date,
    time: string,
    location: string | null,
  ): Promise<Service | null>;
}
