import type { Service } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

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
