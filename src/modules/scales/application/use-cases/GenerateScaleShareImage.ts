import type { IChurchRepository } from "@/modules/churches/application/ports/IChurchRepository";
import type { IMemberRepository } from "@/modules/members/application/ports/IMemberRepository";
import type { IMinistryRepository } from "@/modules/ministries/application/ports/IMinistryRepository";
import type { IMinistryRoleRepository } from "@/modules/ministries/application/ports/IMinistryRoleRepository";
import type { IServiceRepository } from "@/modules/services/application/ports/IServiceRepository";
import type { IScaleMemberRepository } from "@/modules/scales/application/ports/IScaleMemberRepository";
import type { IScaleRepository } from "@/modules/scales/application/ports/IScaleRepository";
import type { IScaleShareImageGenerator } from "../ports/IScaleShareImageGenerator";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import { ScaleErrors } from "../errors/ScaleErrors";

export interface GenerateScaleShareImageInput {
  scaleId: string;
  churchId: string;
}

export interface GenerateScaleShareImageOutput {
  file: Uint8Array;
  fileName: string;
}

export class GenerateScaleShareImage extends BaseUseCase<
  GenerateScaleShareImageInput,
  GenerateScaleShareImageOutput
> {
  constructor(
    private readonly scaleRepository: IScaleRepository,
    private readonly scaleMemberRepository: IScaleMemberRepository,
    private readonly churchRepository: IChurchRepository,
    private readonly serviceRepository: IServiceRepository,
    private readonly ministryRepository: IMinistryRepository,
    private readonly ministryRoleRepository: IMinistryRoleRepository,
    private readonly memberRepository: IMemberRepository,
    private readonly imageGenerator: IScaleShareImageGenerator,
  ) {
    super();
  }

  async execute(
    input: GenerateScaleShareImageInput,
  ): Promise<Result<GenerateScaleShareImageOutput>> {
    try {
      const scale = await this.scaleRepository.findById(input.scaleId);
      if (!scale || scale.status !== "published") {
        return { ok: false, error: ScaleErrors.SCALE_NOT_FOUND };
      }

      const service = await this.serviceRepository.findById(scale.serviceId);
      if (!service || service.churchId !== input.churchId) {
        return { ok: false, error: ScaleErrors.SCALE_NOT_FOUND };
      }

      const [church, ministry, roles, scaleMembers] = await Promise.all([
        this.churchRepository.findById(input.churchId),
        this.ministryRepository.findById(scale.ministryId),
        this.ministryRoleRepository.findByMinistryId(scale.ministryId),
        this.scaleMemberRepository.findByScaleId(scale.id),
      ]);

      if (!church || !ministry || ministry.churchId !== input.churchId) {
        return { ok: false, error: ScaleErrors.SCALE_NOT_FOUND };
      }

      const [members] = await Promise.all([
        this.memberRepository.findByIds(
          scaleMembers.map((scaleMember) => scaleMember.memberId),
        ),
      ]);
      const memberNames = new Map(members.map((member) => [member.id, member.fullName]));
      const roleById = new Map(roles.map((role) => [role.id, role]));
      const membersByRole = new Map<string, string[]>();

      for (const scaleMember of scaleMembers) {
        const role = roleById.get(scaleMember.ministryRoleId);
        const memberName = memberNames.get(scaleMember.memberId);
        if (!role || !memberName) continue;
        const current = membersByRole.get(role.id) ?? [];
        current.push(memberName);
        membersByRole.set(role.id, current);
      }

      const image = await this.imageGenerator.generate({
        churchName: church.name,
        ministryName: ministry.name,
        serviceTitle: service.title,
        serviceDateLabel: service.date.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        serviceTime: service.time.slice(0, 5),
        notes: scale.notes,
        roles: roles
          .filter((role) => membersByRole.has(role.id))
          .map((role) => ({
            name: role.name,
            requiredCount: role.requiredCount,
            memberNames: (membersByRole.get(role.id) ?? []).sort((a, b) =>
              a.localeCompare(b, "pt-BR", { sensitivity: "base" }),
            ),
          })),
      });

      return {
        ok: true,
        value: {
          file: image,
          fileName: `escala-${scale.id}.png`,
        },
      };
    } catch {
      return { ok: false, error: ScaleErrors.SCALE_NOT_FOUND };
    }
  }
}
