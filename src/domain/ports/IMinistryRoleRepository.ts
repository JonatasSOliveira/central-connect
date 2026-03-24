import type { MinistryRole } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IMinistryRoleRepository extends BaseRepository<MinistryRole> {
  findByMinistryId(ministryId: string): Promise<MinistryRole[]>;
  findByChurchId(churchId: string): Promise<MinistryRole[]>;
}
