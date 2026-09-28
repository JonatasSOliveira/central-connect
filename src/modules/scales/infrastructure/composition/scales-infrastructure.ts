import { getDatabaseClient } from "@/infra/database/get-database-client";
import { createTransactionalUseCase } from "@/infra/database/create-transactional-use-case";
import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { ChurchDrizzleRepository } from "@/modules/churches/infrastructure/persistence/drizzle/ChurchDrizzleRepository";
import { MemberAvailabilityDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberAvailabilityDrizzleRepository";
import { MemberChurchDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberChurchDrizzleRepository";
import { MemberDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberDrizzleRepository";
import { MemberMinistryDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberMinistryDrizzleRepository";
import { ListMinistries } from "@/modules/ministries/application/use-cases/ListMinistries";
import { MinistryDrizzleRepository } from "@/modules/ministries/infrastructure/persistence/drizzle/MinistryDrizzleRepository";
import { MinistryRoleDrizzleRepository } from "@/modules/ministries/infrastructure/persistence/drizzle/MinistryRoleDrizzleRepository";
import { createNotificationsInfrastructure } from "@/modules/notifications/infrastructure/composition/notifications-infrastructure";
import { AddMemberToScale } from "@/modules/scales/application/use-cases/AddMemberToScale";
import { CreateScale } from "@/modules/scales/application/use-cases/CreateScale";
import { DeleteScale } from "@/modules/scales/application/use-cases/DeleteScale";
import { GetScale } from "@/modules/scales/application/use-cases/GetScale";
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
import { ScaleAttendanceDrizzleRepository } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleAttendanceDrizzleRepository";
import { ScaleAttendanceMemberDrizzleRepository } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleAttendanceMemberDrizzleRepository";
import { ScaleDrizzleRepository } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleDrizzleRepository";
import { ScaleMemberDrizzleRepository } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleMemberDrizzleRepository";
import { ScaleGenerationJobDrizzleRepository } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleGenerationJobDrizzleRepository";
import { ScaleNotificationServiceAdapter } from "@/modules/scales/infrastructure/services/ScaleNotificationServiceAdapter";
import { ServiceDrizzleRepository } from "@/modules/services/infrastructure/persistence/drizzle/ServiceDrizzleRepository";

export function createScalesInfrastructure() {
  const database = getDatabaseClient();
  const scaleRepository = new ScaleDrizzleRepository(database);
  const scaleMemberRepository = new ScaleMemberDrizzleRepository(database);
  const scaleAttendanceRepository = new ScaleAttendanceDrizzleRepository(
    database,
  );
  const scaleAttendanceMemberRepository =
    new ScaleAttendanceMemberDrizzleRepository(database);
  const scaleGenerationJobRepository = new ScaleGenerationJobDrizzleRepository(
    database,
  );
  const churchRepository = new ChurchDrizzleRepository(database);
  const memberRepository = new MemberDrizzleRepository(database);
  const ministryRepository = new MinistryDrizzleRepository(database);
  const ministryRoleRepository = new MinistryRoleDrizzleRepository(database);
  const serviceRepository = new ServiceDrizzleRepository(database);
  const notificationDependencies = createNotificationsInfrastructure();
  const notificationService = new ScaleNotificationServiceAdapter(
    notificationDependencies,
  );

  const createScale = createTransactionalUseCase(database, (transaction) =>
    createScaleUseCase(transaction),
  );

  const useCases = {
    addMemberToScale: new AddMemberToScale(
      scaleRepository,
      scaleMemberRepository,
    ),
    createScale,
    deleteScale: new DeleteScale(
      scaleRepository,
      scaleMemberRepository,
      scaleAttendanceRepository,
      scaleAttendanceMemberRepository,
    ),
    getScale: new GetScale(scaleRepository, scaleMemberRepository),
    listScales: new ListScales(scaleRepository),
    updateScale: createTransactionalUseCase(database, (transaction) =>
      createUpdateScaleUseCase(transaction),
    ),
    getScaleAttendance: new GetScaleAttendance(
      scaleRepository,
      scaleMemberRepository,
      scaleAttendanceRepository,
      scaleAttendanceMemberRepository,
      memberRepository,
      serviceRepository,
    ),
    getScaleAttendanceReport: new GetScaleAttendanceReport(
      scaleRepository,
      scaleMemberRepository,
      scaleAttendanceRepository,
      scaleAttendanceMemberRepository,
      serviceRepository,
      ministryRepository,
    ),
    listMyScales: new ListMyScales(
      scaleMemberRepository,
      scaleRepository,
      serviceRepository,
      ministryRepository,
      ministryRoleRepository,
    ),
    listScaleAttendances: new ListScaleAttendances(
      scaleRepository,
      scaleMemberRepository,
      scaleAttendanceRepository,
      scaleAttendanceMemberRepository,
      serviceRepository,
      ministryRepository,
    ),
    publishScaleAttendance: new PublishScaleAttendance(
      scaleRepository,
      scaleMemberRepository,
      scaleAttendanceRepository,
      scaleAttendanceMemberRepository,
      memberRepository,
      serviceRepository,
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
      memberRepository,
      serviceRepository,
    ),
    runScheduledScaleGeneration: new RunScheduledScaleGeneration(
      churchRepository,
      serviceRepository,
      ministryRepository,
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
          return notificationService.notifyScaleMembers(input);
        },
      },
      notifyPublishedScalesByDate: {
        execute(input: unknown) {
          return notificationService.notifyPublishedScalesByDate(input);
        },
      },
    },
    ministries: {
      listMinistries: new ListMinistries(
        ministryRepository,
        ministryRoleRepository,
        scaleRepository,
      ),
    },
  };
}

export type ScalesInfrastructure = ReturnType<
  typeof createScalesInfrastructure
>;

function createScaleUseCase(database: DatabaseExecutor) {
  return new CreateScale(
    new ScaleDrizzleRepository(database),
    new ScaleMemberDrizzleRepository(database),
    new ChurchDrizzleRepository(database),
    new ServiceDrizzleRepository(database),
    new MinistryDrizzleRepository(database),
    new MinistryRoleDrizzleRepository(database),
    new MemberDrizzleRepository(database),
    new MemberChurchDrizzleRepository(database),
    new MemberMinistryDrizzleRepository(database),
    new MemberAvailabilityDrizzleRepository(database),
  );
}

function createUpdateScaleUseCase(database: DatabaseExecutor) {
  return new UpdateScale(
    new ScaleDrizzleRepository(database),
    new ScaleMemberDrizzleRepository(database),
    new ChurchDrizzleRepository(database),
    new ServiceDrizzleRepository(database),
    new MinistryDrizzleRepository(database),
    new MinistryRoleDrizzleRepository(database),
    new MemberDrizzleRepository(database),
    new MemberChurchDrizzleRepository(database),
    new MemberMinistryDrizzleRepository(database),
  );
}
