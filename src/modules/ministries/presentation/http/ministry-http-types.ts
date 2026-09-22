import type { CreateMinistry } from "@/modules/ministries/application/use-cases/CreateMinistry";
import type { DeleteMinistry } from "@/modules/ministries/application/use-cases/DeleteMinistry";
import type { GetMinistry } from "@/modules/ministries/application/use-cases/GetMinistry";
import type { ListMinistries } from "@/modules/ministries/application/use-cases/ListMinistries";
import type { UpdateMinistry } from "@/modules/ministries/application/use-cases/UpdateMinistry";
import type { AuthResult } from "@/shared/contracts/auth";

export interface MinistryUseCases {
  createMinistry: Pick<CreateMinistry, "execute">;
  deleteMinistry: Pick<DeleteMinistry, "execute">;
  getMinistry: Pick<GetMinistry, "execute">;
  listMinistries: Pick<ListMinistries, "execute">;
  updateMinistry: Pick<UpdateMinistry, "execute">;
}

export type ValidateSession = () => Promise<AuthResult>;
