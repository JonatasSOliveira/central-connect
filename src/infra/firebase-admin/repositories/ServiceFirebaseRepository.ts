import type { DocumentData } from "firebase-admin/firestore";
import type { Service } from "@/domain/entities/Service";
import type { IServiceRepository } from "@/domain/ports/IServiceRepository";
import {
  serviceFromPersistence,
  serviceToPersistence,
} from "../mappers/serviceMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class ServiceFirebaseRepository
  extends BaseFirebaseRepository<Service>
  implements IServiceRepository
{
  constructor() {
    super("services");
  }

  protected toEntity(data: DocumentData, id: string): Service {
    return serviceFromPersistence(data, id);
  }

  protected toFirestoreData(entity: Service): DocumentData {
    return serviceToPersistence(entity);
  }

  async findByChurchId(churchId: string): Promise<Service[]> {
    const snapshot = await this.collection
      .where("churchId", "==", churchId)
      .where("deletedAt", "==", null)
      .get();

    return snapshot.docs.map((doc) => this.toEntity(doc.data(), doc.id));
  }

  async findByDateRange(
    churchId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Service[]> {
    const snapshot = await this.collection
      .where("churchId", "==", churchId)
      .where("deletedAt", "==", null)
      .get();

    return snapshot.docs
      .map((doc) => this.toEntity(doc.data(), doc.id))
      .filter(
        (service) => service.date >= startDate && service.date <= endDate,
      );
  }

  async findByDateAndLocation(
    churchId: string,
    date: Date,
    time: string,
    location: string | null,
  ): Promise<Service | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const snapshot = await this.collection
      .where("churchId", "==", churchId)
      .where("deletedAt", "==", null)
      .get();

    const results = snapshot.docs
      .map((doc) => this.toEntity(doc.data(), doc.id))
      .filter((service) => {
        const serviceDate = service.date;
        return (
          serviceDate >= startOfDay &&
          serviceDate <= endOfDay &&
          service.time === time &&
          service.location === location
        );
      });

    return results[0] ?? null;
  }
}
