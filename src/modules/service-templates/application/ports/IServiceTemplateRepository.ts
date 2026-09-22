import type { ServiceTemplate } from "@/modules/service-templates/domain/entities/ServiceTemplate";
import type { BaseRepository } from "@/shared/domain/ports/BaseRepository";

export interface IServiceTemplateRepository
  extends BaseRepository<ServiceTemplate> {
  findByChurchId(churchId: string): Promise<ServiceTemplate[]>;
  findActiveByChurchId(churchId: string): Promise<ServiceTemplate[]>;
}
