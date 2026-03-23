import { CreateChurch } from "@/application/use-cases/church/CreateChurch";
import { DeleteChurch } from "@/application/use-cases/church/DeleteChurch";
import { GetChurch } from "@/application/use-cases/church/GetChurch";
import { ListChurches } from "@/application/use-cases/church/ListChurches";
import { UpdateChurch } from "@/application/use-cases/church/UpdateChurch";
import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
import { ChurchFirebaseRepository } from "@/infra/firebase-admin/repositories/ChurchFirebaseRepository";

class ChurchContainer {
  private static _churchRepository: IChurchRepository | null = null;
  private static _createChurch: CreateChurch | null = null;
  private static _getChurch: GetChurch | null = null;
  private static _listChurches: ListChurches | null = null;
  private static _updateChurch: UpdateChurch | null = null;
  private static _deleteChurch: DeleteChurch | null = null;

  private constructor() {}

  static get churchRepository(): IChurchRepository {
    if (!ChurchContainer._churchRepository) {
      ChurchContainer._churchRepository = new ChurchFirebaseRepository();
    }
    return ChurchContainer._churchRepository;
  }

  static get createChurch(): CreateChurch {
    if (!ChurchContainer._createChurch) {
      ChurchContainer._createChurch = new CreateChurch(
        ChurchContainer.churchRepository,
      );
    }
    return ChurchContainer._createChurch;
  }

  static get getChurch(): GetChurch {
    if (!ChurchContainer._getChurch) {
      ChurchContainer._getChurch = new GetChurch(
        ChurchContainer.churchRepository,
      );
    }
    return ChurchContainer._getChurch;
  }

  static get listChurches(): ListChurches {
    if (!ChurchContainer._listChurches) {
      ChurchContainer._listChurches = new ListChurches(
        ChurchContainer.churchRepository,
      );
    }
    return ChurchContainer._listChurches;
  }

  static get updateChurch(): UpdateChurch {
    if (!ChurchContainer._updateChurch) {
      ChurchContainer._updateChurch = new UpdateChurch(
        ChurchContainer.churchRepository,
      );
    }
    return ChurchContainer._updateChurch;
  }

  static get deleteChurch(): DeleteChurch {
    if (!ChurchContainer._deleteChurch) {
      ChurchContainer._deleteChurch = new DeleteChurch(
        ChurchContainer.churchRepository,
      );
    }
    return ChurchContainer._deleteChurch;
  }
}

export const churchContainer = ChurchContainer;
