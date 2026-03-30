import type { DocumentData } from "firebase-admin/firestore";
import type { ServiceTemplate } from "@/domain/entities/ServiceTemplate";
import type { IServiceTemplateRepository } from "@/domain/ports/IServiceTemplateRepository";
import {
  serviceTemplateFromPersistence,
  serviceTemplateToPersistence,
} from "../mappers/serviceTemplateMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class ServiceTemplateFirebaseRepository
  extends BaseFirebaseRepository<ServiceTemplate>
  implements IServiceTemplateRepository
{
  constructor() {
    super("service_templates");
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
      .orderBy("dayOfWeek")
      .get();

    return snapshot.docs.map((doc) => this.toEntity(doc.data(), doc.id));
  }

  async findActiveByChurchId(churchId: string): Promise<ServiceTemplate[]> {
    const snapshot = await this.collection
      .where("churchId", "==", churchId)
      .where("isActive", "==", true)
      .where("deletedAt", "==", null)
      .get();

    return snapshot.docs.map((doc) => this.toEntity(doc.data(), doc.id));
  }
}
