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
    const snapshot = await this.collection.where("churchId", "==", churchId).get();

    const normalizedStart = new Date(startDate);
    const normalizedEnd = new Date(endDate);

    return snapshot.docs
      .filter((doc) => {
        const data = doc.data();

        if (data.deletedAt) {
          return false;
        }

        const dateField = data.date;
        const serviceDate =
          dateField && typeof dateField.toDate === "function"
            ? dateField.toDate()
            : new Date(dateField);

        if (Number.isNaN(serviceDate.getTime())) {
          return false;
        }

        return serviceDate >= normalizedStart && serviceDate <= normalizedEnd;
      })
      .map((doc) => this.toEntity(doc.data(), doc.id));
  }

  async findByDateAndLocation(
    churchId: string,
    date: Date,
    time: string,
    location: string | null,
  ): Promise<Service | null> {
    const targetDateKey = date.toISOString().slice(0, 10);

    const snapshot = await this.collection.where("churchId", "==", churchId).get();

    const matchingDoc = snapshot.docs.find((doc) => {
      const data = doc.data();

      if (data.deletedAt) {
        return false;
      }

      const dateField = data.date;
      const serviceDate =
        dateField && typeof dateField.toDate === "function"
          ? dateField.toDate()
          : new Date(dateField);

      if (Number.isNaN(serviceDate.getTime())) {
        return false;
      }

      const sameDate = serviceDate.toISOString().slice(0, 10) === targetDateKey;
      const sameTime = (data.time ?? "") === time;
      const sameLocation = (data.location ?? null) === location;

      return sameDate && sameTime && sameLocation;
    });

    if (!matchingDoc) {
      return null;
    }

    return this.toEntity(matchingDoc.data(), matchingDoc.id);
  }
}
