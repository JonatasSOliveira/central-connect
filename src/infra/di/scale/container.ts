import { CreateScale } from "@/application/use-cases/scale/CreateScale";
import { DeleteScale } from "@/application/use-cases/scale/DeleteScale";
import { GetScale } from "@/application/use-cases/scale/GetScale";
import { ListScales } from "@/application/use-cases/scale/ListScales";
import { UpdateScale } from "@/application/use-cases/scale/UpdateScale";
import type { IScaleRepository } from "@/domain/ports/IScaleRepository";
import type { IScaleMemberRepository } from "@/domain/ports/IScaleMemberRepository";
import { ScaleFirebaseRepository } from "@/infra/firebase-admin/repositories/ScaleFirebaseRepository";
import { ScaleMemberFirebaseRepository } from "@/infra/firebase-admin/repositories/ScaleMemberFirebaseRepository";

class ScaleContainer {
  private static _createScale: CreateScale | null = null;
  private static _deleteScale: DeleteScale | null = null;
  private static _getScale: GetScale | null = null;
  private static _listScales: ListScales | null = null;
  private static _updateScale: UpdateScale | null = null;
  private static _scaleMemberRepository: IScaleMemberRepository | null = null;
  private static _scaleRepository: IScaleRepository | null = null;

  private constructor() {}

  static get createScale(): CreateScale {
    if (!ScaleContainer._createScale) {
      ScaleContainer._createScale = new CreateScale(
        ScaleContainer.scaleRepository,
        ScaleContainer.scaleMemberRepository,
      );
    }
    return ScaleContainer._createScale;
  }

  static get deleteScale(): DeleteScale {
    if (!ScaleContainer._deleteScale) {
      ScaleContainer._deleteScale = new DeleteScale(
        ScaleContainer.scaleRepository,
        ScaleContainer.scaleMemberRepository,
      );
    }
    return ScaleContainer._deleteScale;
  }

  static get getScale(): GetScale {
    if (!ScaleContainer._getScale) {
      ScaleContainer._getScale = new GetScale(
        ScaleContainer.scaleRepository,
        ScaleContainer.scaleMemberRepository,
      );
    }
    return ScaleContainer._getScale;
  }

  static get listScales(): ListScales {
    if (!ScaleContainer._listScales) {
      ScaleContainer._listScales = new ListScales(
        ScaleContainer.scaleRepository,
      );
    }
    return ScaleContainer._listScales;
  }

  static get updateScale(): UpdateScale {
    if (!ScaleContainer._updateScale) {
      ScaleContainer._updateScale = new UpdateScale(
        ScaleContainer.scaleRepository,
        ScaleContainer.scaleMemberRepository,
      );
    }
    return ScaleContainer._updateScale;
  }

  static get scaleMemberRepository(): IScaleMemberRepository {
    if (!ScaleContainer._scaleMemberRepository) {
      ScaleContainer._scaleMemberRepository =
        new ScaleMemberFirebaseRepository();
    }
    return ScaleContainer._scaleMemberRepository;
  }

  static get scaleRepository(): IScaleRepository {
    if (!ScaleContainer._scaleRepository) {
      ScaleContainer._scaleRepository = new ScaleFirebaseRepository();
    }
    return ScaleContainer._scaleRepository;
  }
}

export const scaleContainer = ScaleContainer;
