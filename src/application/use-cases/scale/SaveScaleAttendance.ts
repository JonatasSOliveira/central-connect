import type {
  SaveScaleAttendanceEntryInput,
  ScaleAttendanceDetailDTO,
} from "@/application/dtos/scale/ScaleAttendanceDTO";
import { ScaleAttendanceErrors } from "@/application/errors/ScaleAttendanceErrors";
import {
  ScaleAttendance,
  type ScaleAttendanceParams,
} from "@/domain/entities/ScaleAttendance";
import {
  ScaleAttendanceMember,
  type ScaleAttendanceMemberParams,
} from "@/domain/entities/ScaleAttendanceMember";
import type { IScaleAttendanceMemberRepository } from "@/domain/ports/IScaleAttendanceMemberRepository";
import type { IScaleAttendanceRepository } from "@/domain/ports/IScaleAttendanceRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { IScaleMemberRepository } from "@/domain/ports/IScaleMemberRepository";
import type { IScaleRepository } from "@/domain/ports/IScaleRepository";
import type { IServiceRepository } from "@/domain/ports/IServiceRepository";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";

export interface SaveScaleAttendanceInput {
  scaleId: string;
  entries: SaveScaleAttendanceEntryInput[];
  checkedByUserId: string;
  allowPublishedEdit: boolean;
}

export interface SaveScaleAttendanceOutput {
  attendance: ScaleAttendanceDetailDTO;
}

export class SaveScaleAttendance extends BaseUseCase<
  SaveScaleAttendanceInput,
  SaveScaleAttendanceOutput
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
    input: SaveScaleAttendanceInput,
  ): Promise<Result<SaveScaleAttendanceOutput>> {
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
          createdByUserId: input.checkedByUserId,
          updatedByUserId: input.checkedByUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        attendance = await this.scaleAttendanceRepository.create(
          new ScaleAttendance(attendanceParams),
        );
      }

      if (attendance.status === "published" && !input.allowPublishedEdit) {
        return {
          ok: false,
          error: ScaleAttendanceErrors.ATTENDANCE_ALREADY_PUBLISHED,
        };
      }

      const scaleMembers = await this.scaleMemberRepository.findByScaleId(
        scale.id,
      );
      const scaleMemberById = new Map(
        scaleMembers.map((scaleMember) => [scaleMember.id, scaleMember]),
      );

      for (const entry of input.entries) {
        const scaleMember = scaleMemberById.get(entry.scaleMemberId);
        if (!scaleMember) {
          return {
            ok: false,
            error: ScaleAttendanceErrors.SCALE_MEMBER_NOT_IN_SCALE,
          };
        }

        const cleanedJustification = entry.justification?.trim() ?? "";
        if (entry.status === "absent_excused" && !cleanedJustification) {
          return {
            ok: false,
            error: ScaleAttendanceErrors.INVALID_ATTENDANCE_JUSTIFICATION,
          };
        }

        const existingAttendanceMember =
          await this.scaleAttendanceMemberRepository.findByScaleMemberId(
            entry.scaleMemberId,
          );

        const attendanceMemberParams: ScaleAttendanceMemberParams = {
          id: existingAttendanceMember?.id,
          scaleAttendanceId: attendance.id,
          scaleId: scale.id,
          scaleMemberId: scaleMember.id,
          memberId: scaleMember.memberId,
          status: entry.status,
          justification:
            entry.status === "absent_excused" ? cleanedJustification : null,
          checkedAt: new Date(),
          checkedByUserId: input.checkedByUserId,
          createdAt: existingAttendanceMember?.createdAt ?? new Date(),
          updatedAt: new Date(),
        };

        const attendanceMember = new ScaleAttendanceMember(
          attendanceMemberParams,
        );
        if (existingAttendanceMember) {
          await this.scaleAttendanceMemberRepository.update(attendanceMember);
        } else {
          await this.scaleAttendanceMemberRepository.create(attendanceMember);
        }
      }

      if (attendance.updatedByUserId !== input.checkedByUserId) {
        const updatedAttendance = new ScaleAttendance({
          id: attendance.id,
          churchId: attendance.churchId,
          scaleId: attendance.scaleId,
          status: attendance.status,
          publishedAt: attendance.publishedAt,
          publishedByUserId: attendance.publishedByUserId,
          createdByUserId: attendance.createdByUserId,
          updatedByUserId: input.checkedByUserId,
          createdAt: attendance.createdAt,
          updatedAt: new Date(),
        });
        attendance =
          await this.scaleAttendanceRepository.update(updatedAttendance);
      }

      const attendanceMembers =
        await this.scaleAttendanceMemberRepository.findByScaleAttendanceId(
          attendance.id,
        );
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
        error: ScaleAttendanceErrors.ATTENDANCE_SAVE_FAILED,
      };
    }
  }
}
