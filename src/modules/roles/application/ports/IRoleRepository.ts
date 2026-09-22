import type { UserRole } from "@/modules/roles/domain/entities/UserRole";

export interface IRoleRepository {
  create(role: UserRole): Promise<UserRole>;
  findById(id: string): Promise<UserRole | null>;
  findByName(name: string): Promise<UserRole | null>;
  findAll(): Promise<UserRole[]>;
  update(role: UserRole): Promise<UserRole>;
  delete(id: string): Promise<void>;
}
