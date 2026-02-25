import { db } from "@/infra/firebase/admin"; // seu Firestore inicializado
import { UserRepository } from "@/domain/ports/auth/UserRepository.port";
import { User } from "@/domain/entities/User/User";

export class FirebaseUserRepositoryAdapter implements UserRepository {
  private collection = db.collection("users");

  public async save(user: User): Promise<void> {
    await this.collection.doc(user.id).set({
      email: user.email,
      displayName: user.displayName,
    });
  }

  public async findById(id: string): Promise<User | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    return new User({ id, email: data.email, displayName: data.displayName });
  }

  public async findByEmail(email: string): Promise<User | null> {
    const query = await this.collection
      .where("email", "==", email)
      .limit(1)
      .get();
    if (query.empty) return null;
    const doc = query.docs[0];
    const data = doc.data();
    return new User({
      id: doc.id,
      email: data.email,
      displayName: data.displayName,
    });
  }
}
