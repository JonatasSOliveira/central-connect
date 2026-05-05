import type { MyScaleListItemDTO, MyScalesPeriod } from "@/application/dtos/scale/MyScalesDTO";
import type { IMinistryRepository } from "@/domain/ports/IMinistryRepository";
import type { IMinistryRoleRepository } from "@/domain/ports/IMinistryRoleRepository";
import type { IScaleMemberRepository } from "@/domain/ports/IScaleMemberRepository";
import type { IScaleRepository } from "@/domain/ports/IScaleRepository";
import type { IServiceRepository } from "@/domain/ports/IServiceRepository";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";

export interface ListMyScalesInput {
  churchId: string;
  memberId: string;
  period: MyScalesPeriod;
}

export interface ListMyScalesOutput {
  scales: MyScaleListItemDTO[];
}

export class ListMyScales extends BaseUseCase<ListMyScalesInput, ListMyScalesOutput> {
  constructor(
    private readonly scaleMemberRepository: IScaleMemberRepository,
    private readonly scaleRepository: IScaleRepository,
    private readonly serviceRepository: IServiceRepository,
    private readonly ministryRepository: IMinistryRepository,
    private readonly ministryRoleRepository: IMinistryRoleRepository,
  ) {
    super();
  }

  async execute(input: ListMyScalesInput): Promise<Result<ListMyScalesOutput>> {
    try {
      const memberScales = await this.scaleMemberRepository.findByMemberId(
        input.memberId,
      );

      if (memberScales.length === 0) {
        return { ok: true, value: { scales: [] } };
      }

      const scaleIds = Array.from(new Set(memberScales.map((item) => item.scaleId)));
      const scales = (
        await Promise.all(scaleIds.map((scaleId) => this.scaleRepository.findById(scaleId)))
      ).filter((scale): scale is NonNullable<typeof scale> => scale !== null);
      const publishedScales = scales.filter(
        (scale) => scale.churchId === input.churchId && scale.status === "published",
      );

      if (publishedScales.length === 0) {
        return { ok: true, value: { scales: [] } };
      }

      const services = await this.serviceRepository.findByChurchId(input.churchId);
      const ministries = await this.ministryRepository.findByChurchId(input.churchId);
      const ministryRoles = await Promise.all(
        ministries.map((ministry) =>
          this.ministryRoleRepository.findByMinistryId(ministry.id),
        ),
      );

      const serviceMap = new Map(services.map((service) => [service.id, service]));
      const ministryMap = new Map(ministries.map((ministry) => [ministry.id, ministry]));
      const roleMap = new Map(
        ministryRoles
          .flat()
          .map((role) => [role.id, role]),
      );

      const scaleMap = new Map(publishedScales.map((scale) => [scale.id, scale]));
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const items: MyScaleListItemDTO[] = [];

      for (const memberScale of memberScales) {
        const scale = scaleMap.get(memberScale.scaleId);

        if (!scale) {
          continue;
        }

        const service = serviceMap.get(scale.serviceId);
        const ministry = ministryMap.get(scale.ministryId);
        const role = roleMap.get(memberScale.ministryRoleId);

        if (!service || !ministry || !role) {
          continue;
        }

        const isUpcoming = service.date >= startOfToday;

        if (input.period === "upcoming" && !isUpcoming) {
          continue;
        }

        if (input.period === "past" && isUpcoming) {
          continue;
        }

        items.push({
          scaleId: scale.id,
          serviceId: service.id,
          serviceTitle: service.title,
          serviceDate: service.date,
          serviceTime: service.time,
          ministryId: ministry.id,
          ministryName: ministry.name,
          ministryRoleId: role.id,
          ministryRoleName: role.name,
          scaleNotes: scale.notes,
          memberNotes: memberScale.notes,
        });
      }

      const sorted = items.sort((a, b) => {
        if (input.period === "upcoming") {
          return a.serviceDate.getTime() - b.serviceDate.getTime();
        }

        return b.serviceDate.getTime() - a.serviceDate.getTime();
      });

      return {
        ok: true,
        value: {
          scales: sorted,
        },
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Erro ao listar suas escalas",
        },
      };
    }
  }
}
