import { ChurchFirebaseRepository } from "@/modules/churches/infrastructure/persistence/firebase/ChurchFirebaseRepository";
import { MemberAvailabilityFirebaseRepository } from "@/modules/members/infrastructure/persistence/firebase/MemberAvailabilityFirebaseRepository";
import { MemberChurchFirebaseRepository } from "@/modules/members/infrastructure/persistence/firebase/MemberChurchFirebaseRepository";
import { MemberFirebaseRepository } from "@/modules/members/infrastructure/persistence/firebase/MemberFirebaseRepository";
import { MemberMinistryFirebaseRepository } from "@/modules/members/infrastructure/persistence/firebase/MemberMinistryFirebaseRepository";
import { ListMinistries } from "@/modules/ministries/application/use-cases/ListMinistries";
import { MinistryFirebaseRepository } from "@/modules/ministries/infrastructure/persistence/firebase/MinistryFirebaseRepository";
import { MinistryRoleFirebaseRepository } from "@/modules/ministries/infrastructure/persistence/firebase/MinistryRoleFirebaseRepository";
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
import { ScaleAttendanceFirebaseRepository } from "@/modules/scales/infrastructure/persistence/firebase/ScaleAttendanceFirebaseRepository";
import { ScaleAttendanceMemberFirebaseRepository } from "@/modules/scales/infrastructure/persistence/firebase/ScaleAttendanceMemberFirebaseRepository";
import { ScaleFirebaseRepository } from "@/modules/scales/infrastructure/persistence/firebase/ScaleFirebaseRepository";
import { ScaleMemberFirebaseRepository } from "@/modules/scales/infrastructure/persistence/firebase/ScaleMemberFirebaseRepository";
import { ScaleNotificationServiceAdapter } from "@/modules/scales/infrastructure/services/ScaleNotificationServiceAdapter";
import { ServiceFirebaseRepository } from "@/modules/services/infrastructure/persistence/firebase/ServiceFirebaseRepository";

export function createScalesInfrastructure() {
  const scaleRepository = new ScaleFirebaseRepository();
  const scaleMemberRepository = new ScaleMemberFirebaseRepository();
  const scaleAttendanceRepository = new ScaleAttendanceFirebaseRepository();
  const scaleAttendanceMemberRepository =
    new ScaleAttendanceMemberFirebaseRepository();
  const churchRepository = new ChurchFirebaseRepository();
  const memberRepository = new MemberFirebaseRepository();
  const memberChurchRepository = new MemberChurchFirebaseRepository();
  const memberMinistryRepository = new MemberMinistryFirebaseRepository();
  const memberAvailabilityRepository =
    new MemberAvailabilityFirebaseRepository();
  const ministryRepository = new MinistryFirebaseRepository();
  const ministryRoleRepository = new MinistryRoleFirebaseRepository();
  const serviceRepository = new ServiceFirebaseRepository();
  const notificationDependencies = createNotificationsInfrastructure();
  const notificationService = new ScaleNotificationServiceAdapter(
    notificationDependencies,
  );

  const createScale = new CreateScale(
    scaleRepository,
    scaleMemberRepository,
    churchRepository,
    serviceRepository,
    ministryRepository,
    ministryRoleRepository,
    memberRepository,
    memberChurchRepository,
    memberMinistryRepository,
    memberAvailabilityRepository,
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
    updateScale: new UpdateScale(
      scaleRepository,
      scaleMemberRepository,
      churchRepository,
      serviceRepository,
      ministryRepository,
      ministryRoleRepository,
      memberRepository,
      memberChurchRepository,
      memberMinistryRepository,
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
