import type { DocumentData } from "firebase-admin/firestore";
import { User, type UserParams } from "@/domain/entities/User";
import type { IUserRepository } from "@/domain/ports/IUserRepository";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class UserFirebaseRepository
  extends BaseFirebaseRepository<User>
  implements IUserRepository
{
  constructor() {
    super("users");
  }

  protected toEntity(data: DocumentData, id: string): User {
    const convertedData = convertTimestampsToDates(data);
    const params: UserParams = {
      id,
      ...convertedData,
      userRoleId: convertedData.userRoleId ?? "",
      isActive: convertedData.isActive ?? true,
      isSuperAdmin: convertedData.isSuperAdmin ?? false,
    };
    return new User(params);
  }

  protected toFirestoreData(entity: User): DocumentData {
    return convertDatesToTimestamps({ ...entity });
  }

  async findByEmail(email: string): Promise<User | null> {
    const snapshot = await this.collection
      .where("email", "==", email)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }
}
