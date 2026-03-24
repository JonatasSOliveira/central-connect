import { CreateMinistry } from "@/application/use-cases/ministry/CreateMinistry";
import { DeleteMinistry } from "@/application/use-cases/ministry/DeleteMinistry";
import { GetMinistry } from "@/application/use-cases/ministry/GetMinistry";
import { ListMinistries } from "@/application/use-cases/ministry/ListMinistries";
import { UpdateMinistry } from "@/application/use-cases/ministry/UpdateMinistry";
import type { IMemberMinistryRepository } from "@/domain/ports/IMemberMinistryRepository";
import type { IMemberMinistryRoleRepository } from "@/domain/ports/IMemberMinistryRoleRepository";
import type { IMinistryRepository } from "@/domain/ports/IMinistryRepository";
import type { IMinistryRoleRepository } from "@/domain/ports/IMinistryRoleRepository";
import { MemberMinistryFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberMinistryFirebaseRepository";
import { MemberMinistryRoleFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberMinistryRoleFirebaseRepository";
import { MinistryFirebaseRepository } from "@/infra/firebase-admin/repositories/MinistryFirebaseRepository";
import { MinistryRoleFirebaseRepository } from "@/infra/firebase-admin/repositories/MinistryRoleFirebaseRepository";

class MinistryContainer {
  private static _createMinistry: CreateMinistry | null = null;
  private static _deleteMinistry: DeleteMinistry | null = null;
  private static _getMinistry: GetMinistry | null = null;
  private static _listMinistries: ListMinistries | null = null;
  private static _updateMinistry: UpdateMinistry | null = null;
  private static _memberMinistryRepository: IMemberMinistryRepository | null =
    null;
  private static _memberMinistryRoleRepository: IMemberMinistryRoleRepository | null =
    null;
  private static _ministryRepository: IMinistryRepository | null = null;
  private static _ministryRoleRepository: IMinistryRoleRepository | null = null;

  private constructor() {}

  static get createMinistry(): CreateMinistry {
    if (!MinistryContainer._createMinistry) {
      MinistryContainer._createMinistry = new CreateMinistry(
        MinistryContainer.ministryRepository,
        MinistryContainer.ministryRoleRepository,
      );
    }
    return MinistryContainer._createMinistry;
  }

  static get deleteMinistry(): DeleteMinistry {
    if (!MinistryContainer._deleteMinistry) {
      MinistryContainer._deleteMinistry = new DeleteMinistry(
        MinistryContainer.ministryRepository,
        MinistryContainer.ministryRoleRepository,
      );
    }
    return MinistryContainer._deleteMinistry;
  }

  static get getMinistry(): GetMinistry {
    if (!MinistryContainer._getMinistry) {
      MinistryContainer._getMinistry = new GetMinistry(
        MinistryContainer.ministryRepository,
        MinistryContainer.ministryRoleRepository,
      );
    }
    return MinistryContainer._getMinistry;
  }

  static get listMinistries(): ListMinistries {
    if (!MinistryContainer._listMinistries) {
      MinistryContainer._listMinistries = new ListMinistries(
        MinistryContainer.ministryRepository,
        MinistryContainer.ministryRoleRepository,
      );
    }
    return MinistryContainer._listMinistries;
  }

  static get updateMinistry(): UpdateMinistry {
    if (!MinistryContainer._updateMinistry) {
      MinistryContainer._updateMinistry = new UpdateMinistry(
        MinistryContainer.ministryRepository,
        MinistryContainer.ministryRoleRepository,
      );
    }
    return MinistryContainer._updateMinistry;
  }

  static get memberMinistryRepository(): IMemberMinistryRepository {
    if (!MinistryContainer._memberMinistryRepository) {
      MinistryContainer._memberMinistryRepository =
        new MemberMinistryFirebaseRepository();
    }
    return MinistryContainer._memberMinistryRepository;
  }

  static get memberMinistryRoleRepository(): IMemberMinistryRoleRepository {
    if (!MinistryContainer._memberMinistryRoleRepository) {
      MinistryContainer._memberMinistryRoleRepository =
        new MemberMinistryRoleFirebaseRepository();
    }
    return MinistryContainer._memberMinistryRoleRepository;
  }

  static get ministryRepository(): IMinistryRepository {
    if (!MinistryContainer._ministryRepository) {
      MinistryContainer._ministryRepository = new MinistryFirebaseRepository();
    }
    return MinistryContainer._ministryRepository;
  }

  static get ministryRoleRepository(): IMinistryRoleRepository {
    if (!MinistryContainer._ministryRoleRepository) {
      MinistryContainer._ministryRoleRepository =
        new MinistryRoleFirebaseRepository();
    }
    return MinistryContainer._ministryRoleRepository;
  }
}

export const ministryContainer = MinistryContainer;
