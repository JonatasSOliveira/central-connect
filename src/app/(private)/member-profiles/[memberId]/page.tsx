import { MemberProfileDetailScreen } from "@/features/member-profiles/components/MemberProfileDetailScreen";

interface MemberProfileDetailPageProps {
  params: Promise<{ memberId: string }>;
}

export default async function MemberProfileDetailPage({
  params,
}: MemberProfileDetailPageProps) {
  const { memberId } = await params;
  return <MemberProfileDetailScreen memberId={memberId} />;
}
