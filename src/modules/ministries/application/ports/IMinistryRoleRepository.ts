import type { MinistryRole } from "@/modules/ministries/domain/entities/MinistryRole";
import type { BaseRepository } from "@/shared/domain/ports/BaseRepository";

export interface IMinistryRoleRepository extends BaseRepository<MinistryRole> {
  findByMinistryId(ministryId: string): Promise<MinistryRole[]>;
}
