import type { Metadata } from "next";
import { PrivacyPolicyDocument } from "@/features/legal/components/privacy-policy-document";

export const metadata: Metadata = {
  title: "Política de Privacidade | Central Connect",
  description: "Política de Privacidade da plataforma Central Connect.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="h-full overflow-y-auto bg-background px-4 py-8 pb-24 md:py-10">
      <PrivacyPolicyDocument />
    </div>
  );
}
