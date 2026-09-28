import type { DatabaseClient } from "@/infra/database/contracts/database-client";
import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import type { IChurchRepository } from "@/modules/churches/application/ports/IChurchRepository";
import type { IMemberAvailabilityRepository } from "@/modules/members/application/ports/IMemberAvailabilityRepository";
import type { IMemberChurchRepository } from "@/modules/members/application/ports/IMemberChurchRepository";
import type { IMemberMinistryRepository } from "@/modules/members/application/ports/IMemberMinistryRepository";
import type { IMemberRepository } from "@/modules/members/application/ports/IMemberRepository";
import type { IMinistryRepository } from "@/modules/ministries/application/ports/IMinistryRepository";
import type { IMinistryRoleRepository } from "@/modules/ministries/application/ports/IMinistryRoleRepository";
import type { IScaleAttendanceMemberRepository } from "@/modules/scales/application/ports/IScaleAttendanceMemberRepository";
import type { IScaleAttendanceRepository } from "@/modules/scales/application/ports/IScaleAttendanceRepository";
import type { IScaleGenerationJobRepository } from "@/modules/scales/application/ports/IScaleGenerationJobRepository";
import type { IScaleMemberRepository } from "@/modules/scales/application/ports/IScaleMemberRepository";
import type { IScaleNotificationService } from "@/modules/scales/application/ports/IScaleNotificationService";
import type { IScaleRepository } from "@/modules/scales/application/ports/IScaleRepository";
import type { IServiceRepository } from "@/modules/services/application/ports/IServiceRepository";

export interface CreateScaleDependencies {
  churchRepository: IChurchRepository;
  serviceRepository: IServiceRepository;
  ministryRepository: IMinistryRepository;
  ministryRoleRepository: IMinistryRoleRepository;
  memberRepository: IMemberRepository;
  memberChurchRepository: IMemberChurchRepository;
  memberMinistryRepository: IMemberMinistryRepository;
  memberAvailabilityRepository: IMemberAvailabilityRepository;
}

export interface UpdateScaleDependencies {
  churchRepository: IChurchRepository;
  serviceRepository: IServiceRepository;
  ministryRepository: IMinistryRepository;
  ministryRoleRepository: IMinistryRoleRepository;
  memberRepository: IMemberRepository;
  memberChurchRepository: IMemberChurchRepository;
  memberMinistryRepository: IMemberMinistryRepository;
}

export interface ScalesInfrastructureDependencies {
  database: DatabaseClient;
  churchRepository: IChurchRepository;
  memberRepository: IMemberRepository;
  memberChurchRepository: IMemberChurchRepository;
  memberMinistryRepository: IMemberMinistryRepository;
  memberAvailabilityRepository: IMemberAvailabilityRepository;
  ministryRepository: IMinistryRepository;
  ministryRoleRepository: IMinistryRoleRepository;
  serviceRepository: IServiceRepository;
  notificationService: IScaleNotificationService;
  scaleRepository: IScaleRepository;
  scaleMemberRepository: IScaleMemberRepository;
  scaleAttendanceRepository: IScaleAttendanceRepository;
  scaleAttendanceMemberRepository: IScaleAttendanceMemberRepository;
  scaleGenerationJobRepository: IScaleGenerationJobRepository;
  createCreateScaleDependencies: (
    executor: DatabaseExecutor,
  ) => CreateScaleDependencies;
  createUpdateScaleDependencies: (
    executor: DatabaseExecutor,
  ) => UpdateScaleDependencies;
}
