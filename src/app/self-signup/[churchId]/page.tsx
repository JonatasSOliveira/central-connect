import { SelfSignupScreen } from "@/features/self-signup/components/SelfSignupScreen";

interface SelfSignupPageProps {
  params: Promise<{ churchId: string }>;
}

export default async function SelfSignupPage({ params }: SelfSignupPageProps) {
  const { churchId } = await params;
  return <SelfSignupScreen churchId={churchId} />;
}
