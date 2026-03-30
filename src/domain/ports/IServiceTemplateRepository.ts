import type { ServiceTemplate } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IServiceTemplateRepository
  extends BaseRepository<ServiceTemplate> {
  findByChurchId(churchId: string): Promise<ServiceTemplate[]>;
  findActiveByChurchId(churchId: string): Promise<ServiceTemplate[]>;
}
