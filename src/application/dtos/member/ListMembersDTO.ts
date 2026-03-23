export type MemberListItem = {
  id: string;
  fullName: string;
  churchName: string | null;
};

export type ListMembersOutput = {
  members: MemberListItem[];
};
