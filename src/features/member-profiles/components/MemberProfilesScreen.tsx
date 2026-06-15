"use client";

import { PrivateHeader } from "@/components/modules/private-header";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useMemberProfiles } from "@/features/member-profiles/hooks/useMemberProfiles";
import { MemberProfileDashboard } from "./MemberProfileDashboard";
import { MemberProfileFilters } from "./MemberProfileFilters";
import { MemberProfileMembersList } from "./MemberProfileMembersList";
import { MemberProfileTabs } from "./MemberProfileTabs";

export function MemberProfilesScreen() {
  usePermissions({
    requiredPermissions: [Permission.MEMBER_PROFILE_READ],
    redirectTo: "/home",
  });

  const {
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    clearFilters,
    isLoading,
    summary,
    members,
    filterOptions,
  } = useMemberProfiles();

  const ministriesById = Object.fromEntries(
    filterOptions.ministries.map((ministry) => [ministry.value, ministry.label]),
  );

  return (
    <div className="min-h-screen app-background p-6 pt-20">
      <div className="mx-auto max-w-5xl space-y-4">
        <PrivateHeader
          title="Perfis dos membros"
          subtitle="Indicadores e respostas do autocadastro"
          backHref="/home"
        />

        <MemberProfileFilters
          filters={filters}
          filterOptions={filterOptions}
          onChange={setFilters}
          onClear={clearFilters}
        />

        <MemberProfileTabs activeTab={activeTab} onChange={setActiveTab} />

        {isLoading || !summary ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : activeTab === "dashboard" ? (
          <MemberProfileDashboard summary={summary} />
        ) : (
          <MemberProfileMembersList
            members={members}
            ministriesById={ministriesById}
          />
        )}
      </div>
    </div>
  );
}
