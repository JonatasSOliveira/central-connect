"use client";

import { Droplets, HeartHandshake, UserCheck, Users } from "lucide-react";
import type { MemberProfileSummaryDTO } from "@/application/dtos/member-profile/MemberProfileDTO";
import { AcceptedJesusStatus } from "@/domain/enums/AcceptedJesusStatus";
import { MaritalStatus } from "@/domain/enums/MaritalStatus";
import { WaterBaptismStatus } from "@/domain/enums/WaterBaptismStatus";
import { MemberProfileMetricCard } from "./MemberProfileMetricCard";
import { MemberProfileRankingList } from "./MemberProfileRankingList";
import { memberProfileLabels } from "./member-profile-labels";

interface MemberProfileDashboardProps {
  summary: MemberProfileSummaryDTO;
}

function getCount<T extends string>(
  items: { value: T; count: number }[],
  value: T,
): number {
  return items.find((item) => item.value === value)?.count ?? 0;
}

export function MemberProfileDashboard({
  summary,
}: MemberProfileDashboardProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <MemberProfileMetricCard
          title="Com perfil"
          value={summary.totalWithProfile}
          icon={Users}
          description={`${summary.totalMembersInChurch} membros na igreja`}
        />
        <MemberProfileMetricCard
          title="Filtrados"
          value={summary.totalFiltered}
          icon={UserCheck}
          description="Membros no recorte atual"
        />
        <MemberProfileMetricCard
          title="Aceitaram Jesus"
          value={getCount(summary.byAcceptedJesus, AcceptedJesusStatus.Yes)}
          icon={HeartHandshake}
        />
        <MemberProfileMetricCard
          title="Batizados"
          value={getCount(summary.byWaterBaptism, WaterBaptismStatus.Yes)}
          icon={Droplets}
          description={`${getCount(summary.byWaterBaptism, WaterBaptismStatus.WantsBaptism)} querem se batizar`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MemberProfileRankingList
          title="Habilidades"
          items={summary.byPracticalSkill.map((item) => ({
            label: memberProfileLabels.practicalSkills[item.value],
            count: item.count,
          }))}
        />
        <MemberProfileRankingList
          title="Ministerios atuais"
          items={summary.byCurrentMinistry.map((item) => ({
            label: item.ministryName,
            count: item.count,
          }))}
        />
        <MemberProfileRankingList
          title="Ministerios desejados"
          items={summary.byDesiredMinistry.map((item) => ({
            label: item.ministryName,
            count: item.count,
          }))}
        />
        <MemberProfileRankingList
          title="Disponibilidade"
          items={summary.byServiceAvailability.map((item) => ({
            label: memberProfileLabels.availabilitySlots[item.value],
            count: item.count,
          }))}
        />
        <MemberProfileRankingList
          title="Estado civil"
          items={summary.byMaritalStatus.map((item) => ({
            label: memberProfileLabels.maritalStatus[item.value],
            count: item.count,
          }))}
        />
        <MemberProfileRankingList
          title="Batismo"
          items={summary.byWaterBaptism.map((item) => ({
            label: memberProfileLabels.waterBaptized[item.value],
            count: item.count,
          }))}
        />
        <MemberProfileRankingList
          title="Mutirao"
          items={summary.byMutiraoAvailability.map((item) => ({
            label: memberProfileLabels.mutiraoAvailability[item.value],
            count: item.count,
          }))}
        />
        <MemberProfileRankingList
          title="Membros casados"
          items={[
            {
              label: "Casado(a)",
              count: getCount(summary.byMaritalStatus, MaritalStatus.Married),
            },
          ]}
        />
      </div>
    </div>
  );
}
