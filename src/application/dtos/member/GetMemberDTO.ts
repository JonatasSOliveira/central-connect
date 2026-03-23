export type GetMemberOutput = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  status: "Active" | "Inactive" | "Paused";
  avatarUrl: string | null;
  churchId: string | null;
};
