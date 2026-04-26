import type {
  ScaleAttendanceReportItemDTO,
  ScaleAttendanceReportSummaryDTO,
} from "@/application/dtos/scale/ScaleAttendanceReportDTO";
import { ScaleAttendanceErrors } from "@/application/errors/ScaleAttendanceErrors";
import type { IMinistryRepository } from "@/domain/ports/IMinistryRepository";
import type { IScaleAttendanceMemberRepository } from "@/domain/ports/IScaleAttendanceMemberRepository";
import type { IScaleAttendanceRepository } from "@/domain/ports/IScaleAttendanceRepository";
import type { IScaleMemberRepository } from "@/domain/ports/IScaleMemberRepository";
import type { IScaleRepository } from "@/domain/ports/IScaleRepository";
import type { IServiceRepository } from "@/domain/ports/IServiceRepository";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";

export interface GetScaleAttendanceReportInput {
  churchId: string;
  startDate: Date;
  endDate: Date;
  ministryId?: string;
}

export interface GetScaleAttendanceReportOutput {
  summary: ScaleAttendanceReportSummaryDTO;
  items: ScaleAttendanceReportItemDTO[];
}

export class GetScaleAttendanceReport extends BaseUseCase<
  GetScaleAttendanceReportInput,
  GetScaleAttendanceReportOutput
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
    input: GetScaleAttendanceReportInput,
  ): Promise<Result<GetScaleAttendanceReportOutput>> {
    try {
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);

      const [allScales, services, ministries] = await Promise.all([
        this.scaleRepository.findByChurchId(input.churchId),
        this.serviceRepository.findByDateRange(
          input.churchId,
          startDate,
          endDate,
        ),
        this.ministryRepository.findByChurchId(input.churchId),
      ]);

      const serviceById = new Map(
        services.map((service) => [service.id, service]),
      );
      const ministryById = new Map(
        ministries.map((ministry) => [ministry.id, ministry.name]),
      );

      const scales = input.ministryId
        ? allScales.filter(
            (scale) =>
              scale.ministryId === input.ministryId &&
              serviceById.has(scale.serviceId),
          )
        : allScales.filter((scale) => serviceById.has(scale.serviceId));

      const scaleIds = scales.map((scale) => scale.id);

      const [allScaleMembers, allAttendances, allAttendanceMembers] =
        await Promise.all([
          this.scaleMemberRepository.findByScaleIds(scaleIds),
          this.scaleAttendanceRepository.findByScaleIds(scaleIds),
          this.scaleAttendanceMemberRepository.findByScaleIds(scaleIds),
        ]);

      const scaleMembersCountByScaleId = new Map<string, number>();
      for (const scaleMember of allScaleMembers) {
        const current =
          scaleMembersCountByScaleId.get(scaleMember.scaleId) ?? 0;
        scaleMembersCountByScaleId.set(scaleMember.scaleId, current + 1);
      }

      const attendanceByScaleId = new Map(
        allAttendances.map((attendance) => [attendance.scaleId, attendance]),
      );

      const attendanceMembersByScaleId = new Map<
        string,
        typeof allAttendanceMembers
      >();
      for (const attendanceMember of allAttendanceMembers) {
        const current =
          attendanceMembersByScaleId.get(attendanceMember.scaleId) ?? [];
        current.push(attendanceMember);
        attendanceMembersByScaleId.set(attendanceMember.scaleId, current);
      }

      const items = scales.map((scale): ScaleAttendanceReportItemDTO | null => {
        const service = serviceById.get(scale.serviceId) ?? null;
        const ministryName = ministryById.get(scale.ministryId) ?? null;
        const attendance = attendanceByScaleId.get(scale.id) ?? null;
        const attendanceMembers =
          attendanceMembersByScaleId.get(scale.id) ?? [];

        if (!service || !ministryName) {
          return null;
        }

        const presentCount = attendanceMembers.filter(
          (entry) => entry.status === "present",
        ).length;
        const absentUnexcusedCount = attendanceMembers.filter(
          (entry) => entry.status === "absent_unexcused",
        ).length;
        const absentExcusedCount = attendanceMembers.filter(
          (entry) => entry.status === "absent_excused",
        ).length;

        const checkedCount = attendanceMembers.length;
        const memberCount = scaleMembersCountByScaleId.get(scale.id) ?? 0;

        const attendanceStatus = attendance?.status ?? "draft";

        return {
          scaleId: scale.id,
          serviceTitle: service.title,
          serviceDate: service.date,
          serviceTime: service.time,
          ministryId: scale.ministryId,
          ministryName,
          attendanceStatus,
          memberCount,
          checkedCount,
          pendingCount: Math.max(memberCount - checkedCount, 0),
          presentCount,
          absentUnexcusedCount,
          absentExcusedCount,
        };
      });

      const filteredItems = items
        .filter((item): item is ScaleAttendanceReportItemDTO => item !== null)
        .sort((a, b) => b.serviceDate.getTime() - a.serviceDate.getTime());

      const summary = filteredItems.reduce<ScaleAttendanceReportSummaryDTO>(
        (acc, item) => {
          acc.scaleCount += 1;
          acc.memberCount += item.memberCount;
          acc.checkedCount += item.checkedCount;
          acc.pendingCount += item.pendingCount;
          acc.presentCount += item.presentCount;
          acc.absentUnexcusedCount += item.absentUnexcusedCount;
          acc.absentExcusedCount += item.absentExcusedCount;
          if (item.attendanceStatus === "published") {
            acc.publishedCount += 1;
          } else {
            acc.draftCount += 1;
          }
          return acc;
        },
        {
          scaleCount: 0,
          memberCount: 0,
          checkedCount: 0,
          pendingCount: 0,
          presentCount: 0,
          absentUnexcusedCount: 0,
          absentExcusedCount: 0,
          publishedCount: 0,
          draftCount: 0,
          completionRate: 0,
        },
      );

      summary.completionRate =
        summary.memberCount === 0
          ? 0
          : Math.round((summary.presentCount / summary.memberCount) * 100);

      return {
        ok: true,
        value: {
          summary,
          items: filteredItems,
        },
      };
    } catch (error) {
      console.error("[GetScaleAttendanceReport] failed", {
        churchId: input.churchId,
        startDate: input.startDate,
        endDate: input.endDate,
        ministryId: input.ministryId,
        error,
      });
      return {
        ok: false,
        error: ScaleAttendanceErrors.ATTENDANCE_FETCH_FAILED,
      };
    }
  }
}
