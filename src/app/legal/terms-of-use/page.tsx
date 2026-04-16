import type { Metadata } from "next";
import { TermsOfUseDocument } from "@/features/legal/components/terms-of-use-document";

export const metadata: Metadata = {
  title: "Termos de Uso | Central Connect",
  description: "Termos de Uso da plataforma Central Connect.",
};

export default function TermsOfUsePage() {
  return (
    <div className="h-full overflow-y-auto bg-background px-4 py-8 pb-24 md:py-10">
      <TermsOfUseDocument />
    </div>
  );
}
