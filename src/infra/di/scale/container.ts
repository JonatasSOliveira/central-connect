import { AddMemberToScale } from "@/application/use-cases/scale/AddMemberToScale";
import { CreateScale } from "@/application/use-cases/scale/CreateScale";
import { DeleteScale } from "@/application/use-cases/scale/DeleteScale";
import { GetScaleAttendance } from "@/application/use-cases/scale/GetScaleAttendance";
import { GetScale } from "@/application/use-cases/scale/GetScale";
import { ListScaleAttendances } from "@/application/use-cases/scale/ListScaleAttendances";
import { ListScales } from "@/application/use-cases/scale/ListScales";
import { PublishScaleAttendance } from "@/application/use-cases/scale/PublishScaleAttendance";
import { RemoveMemberFromScale } from "@/application/use-cases/scale/RemoveMemberFromScale";
import { SaveScaleAttendance } from "@/application/use-cases/scale/SaveScaleAttendance";
import { UpdateScale } from "@/application/use-cases/scale/UpdateScale";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { IMinistryRepository } from "@/domain/ports/IMinistryRepository";
import type { IScaleAttendanceMemberRepository } from "@/domain/ports/IScaleAttendanceMemberRepository";
import type { IScaleAttendanceRepository } from "@/domain/ports/IScaleAttendanceRepository";
import type { IScaleRepository } from "@/domain/ports/IScaleRepository";
import type { IScaleMemberRepository } from "@/domain/ports/IScaleMemberRepository";
import type { IServiceRepository } from "@/domain/ports/IServiceRepository";
import { MinistryFirebaseRepository } from "@/infra/firebase-admin/repositories/MinistryFirebaseRepository";
import { MemberFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberFirebaseRepository";
import { ScaleAttendanceMemberFirebaseRepository } from "@/infra/firebase-admin/repositories/ScaleAttendanceMemberFirebaseRepository";
import { ScaleAttendanceFirebaseRepository } from "@/infra/firebase-admin/repositories/ScaleAttendanceFirebaseRepository";
import { ScaleFirebaseRepository } from "@/infra/firebase-admin/repositories/ScaleFirebaseRepository";
import { ScaleMemberFirebaseRepository } from "@/infra/firebase-admin/repositories/ScaleMemberFirebaseRepository";
import { ServiceFirebaseRepository } from "@/infra/firebase-admin/repositories/ServiceFirebaseRepository";

class ScaleContainer {
  private static _addMemberToScale: AddMemberToScale | null = null;
  private static _createScale: CreateScale | null = null;
  private static _deleteScale: DeleteScale | null = null;
  private static _getScaleAttendance: GetScaleAttendance | null = null;
  private static _getScale: GetScale | null = null;
  private static _listScaleAttendances: ListScaleAttendances | null = null;
  private static _listScales: ListScales | null = null;
  private static _ministryRepository: IMinistryRepository | null = null;
  private static _memberRepository: IMemberRepository | null = null;
  private static _publishScaleAttendance: PublishScaleAttendance | null = null;
  private static _removeMemberFromScale: RemoveMemberFromScale | null = null;
  private static _saveScaleAttendance: SaveScaleAttendance | null = null;
  private static _scaleAttendanceMemberRepository: IScaleAttendanceMemberRepository | null =
    null;
  private static _scaleAttendanceRepository: IScaleAttendanceRepository | null =
    null;
  private static _updateScale: UpdateScale | null = null;
  private static _scaleMemberRepository: IScaleMemberRepository | null = null;
  private static _scaleRepository: IScaleRepository | null = null;
  private static _serviceRepository: IServiceRepository | null = null;

  private constructor() {}

  static get addMemberToScale(): AddMemberToScale {
    if (!ScaleContainer._addMemberToScale) {
      ScaleContainer._addMemberToScale = new AddMemberToScale(
        ScaleContainer.scaleRepository,
        ScaleContainer.scaleMemberRepository,
      );
    }
    return ScaleContainer._addMemberToScale;
  }

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
        ScaleContainer.scaleAttendanceRepository,
        ScaleContainer.scaleAttendanceMemberRepository,
      );
    }
    return ScaleContainer._deleteScale;
  }

  static get getScaleAttendance(): GetScaleAttendance {
    if (!ScaleContainer._getScaleAttendance) {
      ScaleContainer._getScaleAttendance = new GetScaleAttendance(
        ScaleContainer.scaleRepository,
        ScaleContainer.scaleMemberRepository,
        ScaleContainer.scaleAttendanceRepository,
        ScaleContainer.scaleAttendanceMemberRepository,
        ScaleContainer.memberRepository,
      );
    }
    return ScaleContainer._getScaleAttendance;
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

  static get listScaleAttendances(): ListScaleAttendances {
    if (!ScaleContainer._listScaleAttendances) {
      ScaleContainer._listScaleAttendances = new ListScaleAttendances(
        ScaleContainer.scaleRepository,
        ScaleContainer.scaleMemberRepository,
        ScaleContainer.scaleAttendanceRepository,
        ScaleContainer.scaleAttendanceMemberRepository,
        ScaleContainer.serviceRepository,
        ScaleContainer.ministryRepository,
      );
    }
    return ScaleContainer._listScaleAttendances;
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

  static get scaleAttendanceRepository(): IScaleAttendanceRepository {
    if (!ScaleContainer._scaleAttendanceRepository) {
      ScaleContainer._scaleAttendanceRepository =
        new ScaleAttendanceFirebaseRepository();
    }
    return ScaleContainer._scaleAttendanceRepository;
  }

  static get scaleAttendanceMemberRepository(): IScaleAttendanceMemberRepository {
    if (!ScaleContainer._scaleAttendanceMemberRepository) {
      ScaleContainer._scaleAttendanceMemberRepository =
        new ScaleAttendanceMemberFirebaseRepository();
    }
    return ScaleContainer._scaleAttendanceMemberRepository;
  }

  static get scaleRepository(): IScaleRepository {
    if (!ScaleContainer._scaleRepository) {
      ScaleContainer._scaleRepository = new ScaleFirebaseRepository();
    }
    return ScaleContainer._scaleRepository;
  }

  static get serviceRepository(): IServiceRepository {
    if (!ScaleContainer._serviceRepository) {
      ScaleContainer._serviceRepository = new ServiceFirebaseRepository();
    }
    return ScaleContainer._serviceRepository;
  }

  static get ministryRepository(): IMinistryRepository {
    if (!ScaleContainer._ministryRepository) {
      ScaleContainer._ministryRepository = new MinistryFirebaseRepository();
    }
    return ScaleContainer._ministryRepository;
  }

  static get memberRepository(): IMemberRepository {
    if (!ScaleContainer._memberRepository) {
      ScaleContainer._memberRepository = new MemberFirebaseRepository();
    }
    return ScaleContainer._memberRepository;
  }

  static get removeMemberFromScale(): RemoveMemberFromScale {
    if (!ScaleContainer._removeMemberFromScale) {
      ScaleContainer._removeMemberFromScale = new RemoveMemberFromScale(
        ScaleContainer.scaleRepository,
        ScaleContainer.scaleMemberRepository,
      );
    }
    return ScaleContainer._removeMemberFromScale;
  }

  static get saveScaleAttendance(): SaveScaleAttendance {
    if (!ScaleContainer._saveScaleAttendance) {
      ScaleContainer._saveScaleAttendance = new SaveScaleAttendance(
        ScaleContainer.scaleRepository,
        ScaleContainer.scaleMemberRepository,
        ScaleContainer.scaleAttendanceRepository,
        ScaleContainer.scaleAttendanceMemberRepository,
        ScaleContainer.memberRepository,
      );
    }
    return ScaleContainer._saveScaleAttendance;
  }

  static get publishScaleAttendance(): PublishScaleAttendance {
    if (!ScaleContainer._publishScaleAttendance) {
      ScaleContainer._publishScaleAttendance = new PublishScaleAttendance(
        ScaleContainer.scaleRepository,
        ScaleContainer.scaleMemberRepository,
        ScaleContainer.scaleAttendanceRepository,
        ScaleContainer.scaleAttendanceMemberRepository,
        ScaleContainer.memberRepository,
      );
    }
    return ScaleContainer._publishScaleAttendance;
  }
}

export const scaleContainer = ScaleContainer;
