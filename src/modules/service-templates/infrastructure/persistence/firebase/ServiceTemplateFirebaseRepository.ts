import type { DocumentData } from "firebase-admin/firestore";
import { BaseFirebaseRepository } from "@/infra/firebase-admin/repositories/BaseFirebaseRepository";
import type { IServiceTemplateRepository } from "@/modules/service-templates/application/ports/IServiceTemplateRepository";
import type { ServiceTemplate } from "@/modules/service-templates/domain/entities/ServiceTemplate";
import {
  serviceTemplateFromPersistence,
  serviceTemplateToPersistence,
} from "@/modules/service-templates/infrastructure/mappers/serviceTemplateMapper";

export class ServiceTemplateFirebaseRepository
  extends BaseFirebaseRepository<ServiceTemplate>
  implements IServiceTemplateRepository
{
  constructor() {
    super("serviceTemplates");
  }

  protected toEntity(data: DocumentData, id: string): ServiceTemplate {
    return serviceTemplateFromPersistence(data, id);
  }

  protected toFirestoreData(entity: ServiceTemplate): DocumentData {
    return serviceTemplateToPersistence(entity);
  }

  async findByChurchId(churchId: string): Promise<ServiceTemplate[]> {
    const snapshot = await this.collection
      .where("churchId", "==", churchId)
      .where("deletedAt", "==", null)
      .get();

    return snapshot.docs.map((doc) => this.toEntity(doc.data(), doc.id));
  }

  async findActiveByChurchId(churchId: string): Promise<ServiceTemplate[]> {
    const snapshot = await this.collection
      .where("churchId", "==", churchId)
      .where("deletedAt", "==", null)
      .get();

    return snapshot.docs
      .map((doc) => this.toEntity(doc.data(), doc.id))
      .filter((template) => template.isActive);
  }
}
