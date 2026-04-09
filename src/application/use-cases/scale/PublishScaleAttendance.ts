import type { ScaleAttendanceDetailDTO } from "@/application/dtos/scale/ScaleAttendanceDTO";
import { ScaleAttendanceErrors } from "@/application/errors/ScaleAttendanceErrors";
import {
  ScaleAttendance,
  type ScaleAttendanceParams,
} from "@/domain/entities/ScaleAttendance";
import type { IScaleAttendanceMemberRepository } from "@/domain/ports/IScaleAttendanceMemberRepository";
import type { IScaleAttendanceRepository } from "@/domain/ports/IScaleAttendanceRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { IScaleMemberRepository } from "@/domain/ports/IScaleMemberRepository";
import type { IScaleRepository } from "@/domain/ports/IScaleRepository";
import type { IServiceRepository } from "@/domain/ports/IServiceRepository";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";

export interface PublishScaleAttendanceInput {
  scaleId: string;
  publishedByUserId: string;
}

export interface PublishScaleAttendanceOutput {
  attendance: ScaleAttendanceDetailDTO;
}

export class PublishScaleAttendance extends BaseUseCase<
  PublishScaleAttendanceInput,
  PublishScaleAttendanceOutput
> {
  constructor(
    private readonly scaleRepository: IScaleRepository,
    private readonly scaleMemberRepository: IScaleMemberRepository,
    private readonly scaleAttendanceRepository: IScaleAttendanceRepository,
    private readonly scaleAttendanceMemberRepository: IScaleAttendanceMemberRepository,
    private readonly memberRepository: IMemberRepository,
    private readonly serviceRepository: IServiceRepository,
  ) {
    super();
  }

  async execute(
    input: PublishScaleAttendanceInput,
  ): Promise<Result<PublishScaleAttendanceOutput>> {
    try {
      const scale = await this.scaleRepository.findById(input.scaleId);

      if (!scale) {
        return { ok: false, error: ScaleAttendanceErrors.SCALE_NOT_FOUND };
      }

      const service = await this.serviceRepository.findById(scale.serviceId);

      let attendance = await this.scaleAttendanceRepository.findByScaleId(
        scale.id,
      );

      if (!attendance) {
        const attendanceParams: ScaleAttendanceParams = {
          churchId: scale.churchId,
          scaleId: scale.id,
          status: "draft",
          publishedAt: null,
          publishedByUserId: null,
          createdByUserId: input.publishedByUserId,
          updatedByUserId: input.publishedByUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        attendance = await this.scaleAttendanceRepository.create(
          new ScaleAttendance(attendanceParams),
        );
      }

      if (attendance.status !== "published") {
        const publishedAttendance = new ScaleAttendance({
          id: attendance.id,
          churchId: attendance.churchId,
          scaleId: attendance.scaleId,
          status: "published",
          publishedAt: new Date(),
          publishedByUserId: input.publishedByUserId,
          createdByUserId: attendance.createdByUserId,
          updatedByUserId: input.publishedByUserId,
          createdAt: attendance.createdAt,
          updatedAt: new Date(),
        });
        attendance =
          await this.scaleAttendanceRepository.update(publishedAttendance);
      }

      const [scaleMembers, attendanceMembers] = await Promise.all([
        this.scaleMemberRepository.findByScaleId(scale.id),
        this.scaleAttendanceMemberRepository.findByScaleAttendanceId(
          attendance.id,
        ),
      ]);
      const members = await Promise.all(
        scaleMembers.map((scaleMember) =>
          this.memberRepository.findById(scaleMember.memberId),
        ),
      );
      const memberNameById = new Map(
        members
          .filter((member): member is NonNullable<typeof member> =>
            Boolean(member),
          )
          .map((member) => [member.id, member.fullName]),
      );
      const attendanceByScaleMemberId = new Map(
        attendanceMembers.map((member) => [member.scaleMemberId, member]),
      );

      return {
        ok: true,
        value: {
          attendance: {
            id: attendance.id,
            scaleId: scale.id,
            churchId: scale.churchId,
            serviceDate: service?.date ?? new Date(),
            status: attendance.status,
            publishedAt: attendance.publishedAt,
            publishedByUserId: attendance.publishedByUserId,
            entries: scaleMembers.map((scaleMember) => {
              const checked = attendanceByScaleMemberId.get(scaleMember.id);
              return {
                id: checked?.id ?? null,
                scaleMemberId: scaleMember.id,
                memberId: scaleMember.memberId,
                memberName:
                  memberNameById.get(scaleMember.memberId) ?? "Membro sem nome",
                status: checked?.status ?? "pending",
                justification: checked?.justification ?? null,
                checkedAt: checked?.checkedAt ?? null,
                checkedByUserId: checked?.checkedByUserId ?? null,
              };
            }),
          },
        },
      };
    } catch {
      return {
        ok: false,
        error: ScaleAttendanceErrors.ATTENDANCE_PUBLISH_FAILED,
      };
    }
  }
}
