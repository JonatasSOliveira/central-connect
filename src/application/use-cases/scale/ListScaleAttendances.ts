import type {
  AttendanceTimelineFilter,
  ScaleAttendanceListItemDTO,
} from "@/application/dtos/scale/ListScaleAttendancesDTO";
import { ScaleAttendanceErrors } from "@/application/errors/ScaleAttendanceErrors";
import type { IMinistryRepository } from "@/domain/ports/IMinistryRepository";
import type { IScaleAttendanceMemberRepository } from "@/domain/ports/IScaleAttendanceMemberRepository";
import type { IScaleAttendanceRepository } from "@/domain/ports/IScaleAttendanceRepository";
import type { IScaleMemberRepository } from "@/domain/ports/IScaleMemberRepository";
import type { IScaleRepository } from "@/domain/ports/IScaleRepository";
import type { IServiceRepository } from "@/domain/ports/IServiceRepository";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";

export interface ListScaleAttendancesInput {
  churchId: string;
  filter: AttendanceTimelineFilter;
}

export interface ListScaleAttendancesOutput {
  items: ScaleAttendanceListItemDTO[];
}

export class ListScaleAttendances extends BaseUseCase<
  ListScaleAttendancesInput,
  ListScaleAttendancesOutput
> {
  constructor(
    private readonly scaleRepository: IScaleRepository,
    private readonly scaleMemberRepository: IScaleMemberRepository,
    private readonly scaleAttendanceRepository: IScaleAttendanceRepository,
    private readonly scaleAttendanceMemberRepository: IScaleAttendanceMemberRepository,
    private readonly serviceRepository: IServiceRepository,
    private readonly ministryRepository: IMinistryRepository,
  ) {
    super();
  }

  async execute(
    input: ListScaleAttendancesInput,
  ): Promise<Result<ListScaleAttendancesOutput>> {
    try {
      const scales = await this.scaleRepository.findByChurchId(input.churchId);

      const items = await Promise.all(
        scales.map(async (scale) => {
          const [service, ministry, scaleMembers, attendance, checkedMembers] =
            await Promise.all([
              this.serviceRepository.findById(scale.serviceId),
              this.ministryRepository.findById(scale.ministryId),
              this.scaleMemberRepository.findByScaleId(scale.id),
              this.scaleAttendanceRepository.findByScaleId(scale.id),
              this.scaleAttendanceMemberRepository.findByScaleId(scale.id),
            ]);

          if (!service || !ministry) {
            return null;
          }

          return {
            scaleId: scale.id,
            churchId: scale.churchId,
            serviceId: service.id,
            serviceTitle: service.title,
            serviceDate: service.date,
            serviceTime: service.time,
            ministryId: ministry.id,
            ministryName: ministry.name,
            attendanceStatus: attendance?.status ?? "draft",
            memberCount: scaleMembers.length,
            checkedCount: checkedMembers.length,
          } satisfies ScaleAttendanceListItemDTO;
        }),
      );

      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);

      const filtered = items
        .filter((item): item is ScaleAttendanceListItemDTO => item !== null)
        .filter((item) => {
          if (item.attendanceStatus !== "published") return false;

          const serviceDate = item.serviceDate;

          if (input.filter === "today") {
            return serviceDate >= todayStart && serviceDate <= todayEnd;
          }

          if (input.filter === "upcoming") {
            return serviceDate > todayEnd;
          }

          return serviceDate < todayStart;
        })
        .sort((a, b) => a.serviceDate.getTime() - b.serviceDate.getTime());

      return {
        ok: true,
        value: {
          items: filtered,
        },
      };
    } catch {
      return {
        ok: false,
        error: ScaleAttendanceErrors.ATTENDANCE_FETCH_FAILED,
      };
    }
  }
}
