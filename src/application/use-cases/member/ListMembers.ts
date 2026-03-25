import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
import type { IMemberChurchRepository } from "@/domain/ports/IMemberChurchRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { Result } from "@/shared/types/Result";
import type {
  ListMembersInput,
  ListMembersOutput,
  PaginationInfo,
} from "../../dtos/member/ListMembersDTO";
import { BaseUseCase } from "../BaseUseCase";

const DEFAULT_LIMIT = 50;

export class ListMembers extends BaseUseCase<
  ListMembersInput,
  ListMembersOutput
> {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly memberChurchRepository: IMemberChurchRepository,
    private readonly churchRepository: IChurchRepository,
  ) {
    super();
  }

  async execute(input: ListMembersInput): Promise<Result<ListMembersOutput>> {
    try {
      const page = input.page ?? 1;
      const limit = input.limit ?? DEFAULT_LIMIT;
      const offset = (page - 1) * limit;

      let allChurches: Map<string, string> = new Map();
      let userReadableChurchIds: string[] = [];

      if (input.isSuperAdmin) {
        const churches = await this.churchRepository.findAll();
        allChurches = new Map(churches.map((c) => [c.id, c.name]));
        userReadableChurchIds = Array.from(allChurches.keys());
      } else {
        userReadableChurchIds = (input.userChurches ?? [])
          .filter((c) => c.hasMemberRead)
          .map((c) => c.churchId);

        if (userReadableChurchIds.length === 0) {
          return {
            ok: true,
            value: {
              members: [],
              pagination: this.emptyPagination(page, limit),
            },
          };
        }

        const churches = await this.churchRepository.findAll();
        for (const church of churches) {
          if (userReadableChurchIds.includes(church.id)) {
            allChurches.set(church.id, church.name);
          }
        }
      }

      const allMembers = input.search?.trim()
        ? await this.memberRepository.findBySearch(input.search)
        : await this.memberRepository.findAll();

      const membersWithChurchInfo = await Promise.all(
        allMembers.map(async (member) => {
          const memberChurches =
            await this.memberChurchRepository.findByMemberId(member.id);

          const visibleChurches = memberChurches
            .filter((mc) => userReadableChurchIds.includes(mc.churchId))
            .map((mc) => ({
              churchId: mc.churchId,
              churchName:
                allChurches.get(mc.churchId) ?? "Igreja não encontrada",
            }));

          if (visibleChurches.length === 0) {
            return null;
          }

          if (input.churchId) {
            const hasChurch = memberChurches.some(
              (mc) => mc.churchId === input.churchId,
            );
            if (!hasChurch) {
              return null;
            }
          }

          return {
            id: member.id,
            fullName: member.fullName,
            churches: visibleChurches,
          };
        }),
      );

      const filteredMembers = membersWithChurchInfo.filter(
        (m) => m !== null,
      ) as ListMembersOutput["members"];

      const sortedMembers = filteredMembers.sort((a, b) =>
        a.fullName.localeCompare(b.fullName, "pt-BR", { sensitivity: "base" }),
      );

      const total = sortedMembers.length;
      const paginatedMembers = sortedMembers.slice(offset, offset + limit);
      const hasMore = offset + limit < total;

      const pagination: PaginationInfo = {
        page,
        limit,
        total,
        hasMore,
      };

      return {
        ok: true,
        value: {
          members: paginatedMembers,
          pagination,
        },
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "LIST_MEMBERS_FAILED",
          message: "Falha ao listar membros",
        },
      };
    }
  }

  private emptyPagination(page: number, limit: number): PaginationInfo {
    return { page, limit, total: 0, hasMore: false };
  }
}
