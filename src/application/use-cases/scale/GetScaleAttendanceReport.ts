import type {
  ScaleAttendanceReportItemDTO,
  ScaleAttendanceReportMinistryOptionDTO,
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
  ministries: ScaleAttendanceReportMinistryOptionDTO[];
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
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(input.endDate);
      endDate.setHours(23, 59, 59, 999);

      const allScales = await this.scaleRepository.findByChurchId(
        input.churchId,
      );
      const scales = input.ministryId
        ? allScales.filter((scale) => scale.ministryId === input.ministryId)
        : allScales;

      const ministryCache = new Map<string, string>();
      const getMinistryName = async (
        ministryId: string,
      ): Promise<string | null> => {
        if (ministryCache.has(ministryId)) {
          return ministryCache.get(ministryId) ?? null;
        }

        const ministry = await this.ministryRepository.findById(ministryId);
        if (!ministry) {
          return null;
        }

        ministryCache.set(ministryId, ministry.name);
        return ministry.name;
      };

      const items = await Promise.all(
        scales.map(
          async (scale): Promise<ScaleAttendanceReportItemDTO | null> => {
            const [
              service,
              ministryName,
              scaleMembers,
              attendance,
              attendanceMembers,
            ] = await Promise.all([
              this.serviceRepository.findById(scale.serviceId),
              getMinistryName(scale.ministryId),
              this.scaleMemberRepository.findByScaleId(scale.id),
              this.scaleAttendanceRepository.findByScaleId(scale.id),
              this.scaleAttendanceMemberRepository.findByScaleId(scale.id),
            ]);

            if (!service || !ministryName) {
              return null;
            }

            if (service.date < startDate || service.date > endDate) {
              return null;
            }

            if (attendance?.status !== "published") {
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
            const memberCount = scaleMembers.length;

            return {
              scaleId: scale.id,
              serviceTitle: service.title,
              serviceDate: service.date,
              serviceTime: service.time,
              ministryId: scale.ministryId,
              ministryName,
              attendanceStatus: "published",
              memberCount,
              checkedCount,
              pendingCount: Math.max(memberCount - checkedCount, 0),
              presentCount,
              absentUnexcusedCount,
              absentExcusedCount,
            };
          },
        ),
      );

      const filteredItems = items
        .filter((item): item is ScaleAttendanceReportItemDTO => item !== null)
        .sort((a, b) => b.serviceDate.getTime() - a.serviceDate.getTime());

      const ministries = Array.from(
        filteredItems.reduce((map, item) => {
          map.set(item.ministryId, {
            id: item.ministryId,
            name: item.ministryName,
          });
          return map;
        }, new Map<string, ScaleAttendanceReportMinistryOptionDTO>()),
      )
        .map(([, ministry]) => ministry)
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

      const summary = filteredItems.reduce<ScaleAttendanceReportSummaryDTO>(
        (acc, item) => {
          acc.scaleCount += 1;
          acc.memberCount += item.memberCount;
          acc.checkedCount += item.checkedCount;
          acc.pendingCount += item.pendingCount;
          acc.presentCount += item.presentCount;
          acc.absentUnexcusedCount += item.absentUnexcusedCount;
          acc.absentExcusedCount += item.absentExcusedCount;
          acc.publishedCount += 1;
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
          ministries,
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
