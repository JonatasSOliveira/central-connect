import type { ScaleAttendanceDetailDTO } from "@/application/dtos/scale/ScaleAttendanceDTO";
import { ScaleAttendanceErrors } from "@/application/errors/ScaleAttendanceErrors";
import type { IScaleAttendanceMemberRepository } from "@/domain/ports/IScaleAttendanceMemberRepository";
import type { IScaleAttendanceRepository } from "@/domain/ports/IScaleAttendanceRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { IScaleMemberRepository } from "@/domain/ports/IScaleMemberRepository";
import type { IScaleRepository } from "@/domain/ports/IScaleRepository";
import type { IServiceRepository } from "@/domain/ports/IServiceRepository";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";

export interface GetScaleAttendanceInput {
  scaleId: string;
}

export interface GetScaleAttendanceOutput {
  attendance: ScaleAttendanceDetailDTO;
}

export class GetScaleAttendance extends BaseUseCase<
  GetScaleAttendanceInput,
  GetScaleAttendanceOutput
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
    input: GetScaleAttendanceInput,
  ): Promise<Result<GetScaleAttendanceOutput>> {
    try {
      const scale = await this.scaleRepository.findById(input.scaleId);

      if (!scale) {
        return { ok: false, error: ScaleAttendanceErrors.SCALE_NOT_FOUND };
      }

      const [scaleMembers, attendance, service] = await Promise.all([
        this.scaleMemberRepository.findByScaleId(scale.id).catch(() => []),
        this.scaleAttendanceRepository.findByScaleId(scale.id).catch(() => null),
        this.serviceRepository.findById(scale.serviceId).catch(() => null),
      ]);

      const memberResults = await Promise.allSettled(
        scaleMembers
          .map((scaleMember) => scaleMember.memberId)
          .filter((memberId) => Boolean(memberId))
          .map((memberId) => this.memberRepository.findById(memberId)),
      );
      const members = memberResults
        .filter(
          (
            result,
          ): result is PromiseFulfilledResult<
            Awaited<ReturnType<typeof this.memberRepository.findById>>
          > => result.status === "fulfilled",
        )
        .map((result) => result.value);
      const memberNameById = new Map(
        members
          .filter((member): member is NonNullable<typeof member> =>
            Boolean(member),
          )
          .map((member) => [member.id, member.fullName]),
      );

      const attendanceMembers = attendance
        ? await this.scaleAttendanceMemberRepository.findByScaleAttendanceId(
            attendance.id,
          )
        : [];

      const attendanceByScaleMemberId = new Map(
        attendanceMembers.map((member) => [member.scaleMemberId, member]),
      );

      return {
        ok: true,
        value: {
          attendance: {
            id: attendance?.id ?? null,
            scaleId: scale.id,
            churchId: scale.churchId,
            serviceDate: service?.date ?? new Date(),
            status: attendance?.status ?? "draft",
            publishedAt: attendance?.publishedAt ?? null,
            publishedByUserId: attendance?.publishedByUserId ?? null,
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
    } catch (error) {
      console.error("[GetScaleAttendance] failed", {
        scaleId: input.scaleId,
        error,
      });
      return {
        ok: false,
        error: ScaleAttendanceErrors.ATTENDANCE_FETCH_FAILED,
      };
    }
  }
}
