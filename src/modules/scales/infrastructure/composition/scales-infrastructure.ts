import { createTransactionalUseCase } from "@/infra/database/create-transactional-use-case";
import { ListMinistries } from "@/modules/ministries/application/use-cases/ListMinistries";
import { AddMemberToScale } from "@/modules/scales/application/use-cases/AddMemberToScale";
import { CreateScale } from "@/modules/scales/application/use-cases/CreateScale";
import { DeleteScale } from "@/modules/scales/application/use-cases/DeleteScale";
import { GetScale } from "@/modules/scales/application/use-cases/GetScale";
import { GenerateScaleShareImage } from "@/modules/scales/application/use-cases/GenerateScaleShareImage";
import { GetScaleAttendance } from "@/modules/scales/application/use-cases/GetScaleAttendance";
import { GetScaleAttendanceReport } from "@/modules/scales/application/use-cases/GetScaleAttendanceReport";
import { ListMyScales } from "@/modules/scales/application/use-cases/ListMyScales";
import { ListScaleAttendances } from "@/modules/scales/application/use-cases/ListScaleAttendances";
import { ListScales } from "@/modules/scales/application/use-cases/ListScales";
import { PublishScaleAttendance } from "@/modules/scales/application/use-cases/PublishScaleAttendance";
import { RemoveMemberFromScale } from "@/modules/scales/application/use-cases/RemoveMemberFromScale";
import { RunScheduledScaleGeneration } from "@/modules/scales/application/use-cases/RunScheduledScaleGeneration";
import { SaveScaleAttendance } from "@/modules/scales/application/use-cases/SaveScaleAttendance";
import { UpdateScale } from "@/modules/scales/application/use-cases/UpdateScale";
import { ScaleDrizzleRepository } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleDrizzleRepository";
import { ScaleMemberDrizzleRepository } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleMemberDrizzleRepository";
import { ScaleShareImageGenerator } from "@/modules/scales/infrastructure/services/ScaleShareImageGenerator";
import type {
  CreateScaleDependencies,
  ScalesInfrastructureDependencies,
  UpdateScaleDependencies,
} from "./scales-dependencies";

export function createScalesInfrastructure(
  dependencies: ScalesInfrastructureDependencies,
) {
  const {
    scaleRepository,
    scaleMemberRepository,
    scaleAttendanceRepository,
    scaleAttendanceMemberRepository,
    scaleGenerationJobRepository,
  } = dependencies;

  const createScale = createTransactionalUseCase(
    dependencies.database,
    (transaction) =>
      createScaleUseCase(
        dependencies.createCreateScaleDependencies(transaction),
        new ScaleDrizzleRepository(transaction),
        new ScaleMemberDrizzleRepository(transaction),
      ),
  );

  const useCases = {
    addMemberToScale: new AddMemberToScale(
      scaleRepository,
      scaleMemberRepository,
      dependencies.churchRepository,
      dependencies.serviceRepository,
      dependencies.ministryRepository,
      dependencies.ministryRoleRepository,
      dependencies.memberRepository,
      dependencies.memberChurchRepository,
      dependencies.memberMinistryRepository,
      dependencies.memberMinistryRoleRepository,
    ),
    createScale,
    deleteScale: new DeleteScale(
      scaleRepository,
      scaleMemberRepository,
      scaleAttendanceRepository,
      scaleAttendanceMemberRepository,
    ),
    getScale: new GetScale(
      scaleRepository,
      scaleMemberRepository,
      dependencies.serviceRepository,
    ),
    generateScaleShareImage: new GenerateScaleShareImage(
      scaleRepository,
      scaleMemberRepository,
      dependencies.churchRepository,
      dependencies.serviceRepository,
      dependencies.ministryRepository,
      dependencies.ministryRoleRepository,
      dependencies.memberRepository,
      new ScaleShareImageGenerator(),
    ),
    listScales: new ListScales(
      scaleRepository,
      dependencies.ministryRepository,
      scaleMemberRepository,
    ),
    updateScale: createTransactionalUseCase(
      dependencies.database,
      (transaction) =>
        createUpdateScaleUseCase(
          dependencies.createUpdateScaleDependencies(transaction),
          new ScaleDrizzleRepository(transaction),
          new ScaleMemberDrizzleRepository(transaction),
        ),
    ),
    getScaleAttendance: new GetScaleAttendance(
      scaleRepository,
      scaleMemberRepository,
      scaleAttendanceRepository,
      scaleAttendanceMemberRepository,
      dependencies.memberRepository,
      dependencies.serviceRepository,
    ),
    getScaleAttendanceReport: new GetScaleAttendanceReport(
      scaleRepository,
      scaleMemberRepository,
      scaleAttendanceRepository,
      scaleAttendanceMemberRepository,
      dependencies.serviceRepository,
      dependencies.ministryRepository,
    ),
    listMyScales: new ListMyScales(
      scaleMemberRepository,
      scaleRepository,
      dependencies.serviceRepository,
      dependencies.ministryRepository,
      dependencies.ministryRoleRepository,
    ),
    listScaleAttendances: new ListScaleAttendances(
      scaleRepository,
      scaleMemberRepository,
      scaleAttendanceRepository,
      scaleAttendanceMemberRepository,
      dependencies.serviceRepository,
      dependencies.ministryRepository,
    ),
    publishScaleAttendance: new PublishScaleAttendance(
      scaleRepository,
      scaleMemberRepository,
      scaleAttendanceRepository,
      scaleAttendanceMemberRepository,
      dependencies.memberRepository,
      dependencies.serviceRepository,
    ),
    removeMemberFromScale: new RemoveMemberFromScale(
      scaleRepository,
      scaleMemberRepository,
    ),
    saveScaleAttendance: new SaveScaleAttendance(
      scaleRepository,
      scaleMemberRepository,
      scaleAttendanceRepository,
      scaleAttendanceMemberRepository,
      dependencies.memberRepository,
      dependencies.serviceRepository,
    ),
    runScheduledScaleGeneration: new RunScheduledScaleGeneration(
      dependencies.churchRepository,
      dependencies.serviceRepository,
      dependencies.ministryRepository,
      createScale,
    ),
  };

  return {
    scale: {
      ...useCases,
      scaleMemberRepository,
      scaleAttendanceRepository,
      scaleAttendanceMemberRepository,
      scaleGenerationJobRepository,
    },
    notification: {
      notifyScaleMembers: {
        execute(input: unknown) {
          return dependencies.notificationService.notifyScaleMembers(input);
        },
      },
      notifyPublishedScalesByDate: {
        execute(input: unknown) {
          return dependencies.notificationService.notifyPublishedScalesByDate(
            input,
          );
        },
      },
    },
    ministries: {
      listMinistries: new ListMinistries(
        dependencies.ministryRepository,
        dependencies.ministryRoleRepository,
        scaleRepository,
      ),
    },
  };
}

export type ScalesInfrastructure = ReturnType<
  typeof createScalesInfrastructure
>;

function createScaleUseCase(
  dependencies: CreateScaleDependencies,
  scaleRepository: ScalesInfrastructureDependencies["scaleRepository"],
  scaleMemberRepository: ScalesInfrastructureDependencies["scaleMemberRepository"],
) {
  return new CreateScale(
    scaleRepository,
    scaleMemberRepository,
    dependencies.churchRepository,
    dependencies.serviceRepository,
    dependencies.ministryRepository,
    dependencies.ministryRoleRepository,
    dependencies.memberRepository,
    dependencies.memberChurchRepository,
    dependencies.memberMinistryRepository,
    dependencies.memberMinistryRoleRepository,
    dependencies.memberAvailabilityRepository,
  );
}

function createUpdateScaleUseCase(
  dependencies: UpdateScaleDependencies,
  scaleRepository: ScalesInfrastructureDependencies["scaleRepository"],
  scaleMemberRepository: ScalesInfrastructureDependencies["scaleMemberRepository"],
) {
  return new UpdateScale(
    scaleRepository,
    scaleMemberRepository,
    dependencies.churchRepository,
    dependencies.serviceRepository,
    dependencies.ministryRepository,
    dependencies.ministryRoleRepository,
    dependencies.memberRepository,
    dependencies.memberChurchRepository,
    dependencies.memberMinistryRepository,
    dependencies.memberMinistryRoleRepository,
  );
}
