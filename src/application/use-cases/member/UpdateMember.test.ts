import { describe, expect, it } from "vitest";
import { Member } from "@/domain/entities/Member";
import type { MemberAvailability } from "@/domain/entities/MemberAvailability";
import { MemberChurch } from "@/domain/entities/MemberChurch";
import { MemberMinistry } from "@/domain/entities/MemberMinistry";
import type { IMemberAvailabilityRepository } from "@/domain/ports/IMemberAvailabilityRepository";
import type { IMemberChurchRepository } from "@/domain/ports/IMemberChurchRepository";
import type { IMemberMinistryRepository } from "@/domain/ports/IMemberMinistryRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import { UpdateMember } from "./UpdateMember";

const now = new Date("2026-01-01T00:00:00.000Z");

class MemberRepositoryStub implements IMemberRepository {
  member = new Member({
    id: "member-1",
    email: "member@example.com",
    fullName: "Member One",
    status: "Active",
    createdAt: now,
    updatedAt: now,
  });

  async findById(): Promise<Member | null> {
    return this.member;
  }
  async findAll(): Promise<Member[]> {
    return [this.member];
  }
  async create(entity: Member): Promise<Member> {
    this.member = entity;
    return entity;
  }
  async update(entity: Member): Promise<Member> {
    this.member = entity;
    return entity;
  }
  async delete(): Promise<void> {}
  async findByEmail(): Promise<Member | null> {
    return null;
  }
  async findByNormalizedPhone(): Promise<Member | null> {
    return null;
  }
  async findBySearch(): Promise<Member[]> {
    return [this.member];
  }
  async findByIds(): Promise<Member[]> {
    return [this.member];
  }
}

class MemberChurchRepositoryStub implements IMemberChurchRepository {
  churches = [
    new MemberChurch({
      id: "member-church-1",
      memberId: "member-1",
      churchId: "church-1",
      roleId: "role-1",
      createdAt: now,
      updatedAt: now,
    }),
  ];
  deletedIds: string[] = [];

  async findByMemberId(): Promise<MemberChurch[]> {
    return this.churches;
  }
  async findByMemberIdAndChurchId(): Promise<MemberChurch | null> {
    return this.churches[0] ?? null;
  }
  async findByChurchId(): Promise<MemberChurch[]> {
    return this.churches;
  }
  async findById(): Promise<MemberChurch | null> {
    return this.churches[0] ?? null;
  }
  async findAll(): Promise<MemberChurch[]> {
    return this.churches;
  }
  async create(entity: MemberChurch): Promise<MemberChurch> {
    this.churches.push(entity);
    return entity;
  }
  async update(entity: MemberChurch): Promise<MemberChurch> {
    return entity;
  }
  async delete(id: string): Promise<void> {
    this.deletedIds.push(id);
  }
}

class MemberMinistryRepositoryStub implements IMemberMinistryRepository {
  ministries = [
    new MemberMinistry({
      id: "member-ministry-1",
      memberId: "member-1",
      churchId: "church-1",
      ministryId: "old-ministry",
      createdAt: now,
      updatedAt: now,
    }),
  ];
  deletedIds: string[] = [];
  createdMinistryIds: string[] = [];

  async findByMemberId(): Promise<MemberMinistry[]> {
    return this.ministries;
  }
  async findByChurchId(): Promise<MemberMinistry[]> {
    return this.ministries;
  }
  async findByMinistryId(): Promise<MemberMinistry[]> {
    return this.ministries;
  }
  async findByMemberAndMinistry(): Promise<MemberMinistry | null> {
    return null;
  }
  async findById(): Promise<MemberMinistry | null> {
    return this.ministries[0] ?? null;
  }
  async findAll(): Promise<MemberMinistry[]> {
    return this.ministries;
  }
  async create(entity: MemberMinistry): Promise<MemberMinistry> {
    this.createdMinistryIds.push(entity.ministryId);
    this.ministries.push(entity);
    return entity;
  }
  async update(entity: MemberMinistry): Promise<MemberMinistry> {
    return entity;
  }
  async delete(id: string): Promise<void> {
    this.deletedIds.push(id);
  }
}

const availabilityRepositoryStub = {
  async findById() {
    return null;
  },
  async findAll() {
    return [] as MemberAvailability[];
  },
  async create(entity: MemberAvailability) {
    return entity;
  },
  async update(entity: MemberAvailability) {
    return entity;
  },
  async delete() {},
  async findByMemberId() {
    return null;
  },
  async findByMemberIds() {
    return [] as MemberAvailability[];
  },
  async upsert(entity: MemberAvailability) {
    return entity;
  },
  async deleteByMemberId() {},
} satisfies IMemberAvailabilityRepository;

describe("UpdateMember", () => {
  it("updates ministry assignments without replacing member church role", async () => {
    const memberRepository = new MemberRepositoryStub();
    const memberChurchRepository = new MemberChurchRepositoryStub();
    const memberMinistryRepository = new MemberMinistryRepositoryStub();
    const useCase = new UpdateMember(
      memberRepository,
      memberChurchRepository,
      memberMinistryRepository,
      availabilityRepositoryStub,
    );

    const result = await useCase.execute({
      memberId: "member-1",
      input: {
        ministryAssignments: [
          { churchId: "church-1", ministryIds: ["ministry-1", "ministry-2"] },
        ],
      },
    });

    expect(result.ok).toBe(true);
    expect(memberChurchRepository.deletedIds).toEqual([]);
    expect(memberChurchRepository.churches[0].roleId).toBe("role-1");
    expect(memberMinistryRepository.deletedIds).toEqual(["member-ministry-1"]);
    expect(memberMinistryRepository.createdMinistryIds).toEqual([
      "ministry-1",
      "ministry-2",
    ]);
  });
});
