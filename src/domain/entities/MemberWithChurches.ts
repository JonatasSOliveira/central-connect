import type { Church } from "./Church";
import type { Member } from "./Member";
import type { MemberChurch } from "./MemberChurch";
import type { UserRole } from "./UserRole";

export interface MemberChurchWithDetails extends MemberChurch {
  church?: Church;
  role?: UserRole | null;
}

export interface MemberWithChurches {
  member: Member;
  churches: MemberChurchWithDetails[];
}
