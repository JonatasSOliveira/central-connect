import { BaseModel } from '@/domain/models/base'
import { FirebaseProvider } from '@/infra/firebase/provider'
import {
  addDoc,
  collection,
  CollectionReference,
  Timestamp,
  WithFieldValue,
} from 'firebase/firestore'

export abstract class FirebaseBaseRepository<Model extends BaseModel> {
  protected readonly col: CollectionReference

  constructor(protected readonly collectionName: string) {
    this.col = collection(FirebaseProvider.getFirestore(), this.collectionName)
  }

  public async create(
    data: Partial<Model>,
    // user?: AuthenticatedUserDTO,
  ): Promise<string> {
    const formatedData: WithFieldValue<Partial<Model>> = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      deletedAt: null,
    }

    // if (user) {
    //   formatedData.userId = user.id
    // }

    const docRef = await addDoc(this.col, formatedData)
    return docRef.id
  }
}
