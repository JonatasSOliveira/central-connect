"use client";

import { UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import type { MemberProfileListItemDTO } from "@/application/dtos/member-profile/MemberProfileDTO";
import { Chip } from "@/components/ui/chip";
import { ListTemplate } from "@/components/templates/list-template";
import { labelList, memberProfileLabels } from "./member-profile-labels";

interface MemberProfileMembersListProps {
  members: MemberProfileListItemDTO[];
  ministriesById: Record<string, string>;
}

export function MemberProfileMembersList({
  members,
  ministriesById,
}: MemberProfileMembersListProps) {
  const router = useRouter();

  if (members.length === 0) {
    return (
      <ListTemplate.EmptyState
        icon={UserRound}
        title="Nenhum perfil encontrado"
        description="Ajuste os filtros para encontrar membros com autocadastro."
      />
    );
  }

  return (
    <ListTemplate.List>
      {members.map((member) => {
        const description = [
          member.maritalStatus
            ? memberProfileLabels.maritalStatus[member.maritalStatus]
            : null,
          member.acceptedJesus
            ? `Jesus: ${memberProfileLabels.acceptedJesus[member.acceptedJesus]}`
            : null,
          member.waterBaptized
            ? `Batismo: ${memberProfileLabels.waterBaptized[member.waterBaptized]}`
            : null,
        ]
          .filter(Boolean)
          .join(" • ");

        return (
          <div
            key={member.memberId}
            className="rounded-lg border border-border bg-card p-4"
          >
            <button
              type="button"
              onClick={() => router.push(`/member-profiles/${member.memberId}`)}
              className="w-full text-left"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UserRound className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-heading text-base font-semibold text-foreground">
                    {member.fullName}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {description || "Sem resumo estruturado"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Ministerios: {labelList(member.currentMinistryIds, ministriesById)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {member.practicalSkills.slice(0, 4).map((skill) => (
                      <Chip key={skill} variant="muted">
                        {memberProfileLabels.practicalSkills[skill]}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          </div>
        );
      })}
    </ListTemplate.List>
  );
}
