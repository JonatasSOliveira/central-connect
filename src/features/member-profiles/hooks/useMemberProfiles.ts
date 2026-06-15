"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  MemberProfileFilters,
  MemberProfileFilterOptionsDTO,
  MemberProfileListItemDTO,
  MemberProfileSummaryDTO,
} from "@/application/dtos/member-profile/MemberProfileDTO";
import { buildMemberProfileQuery } from "./memberProfileFilterParams";

type ActiveTab = "dashboard" | "members";

type MemberProfilesApiValue = {
  summary: MemberProfileSummaryDTO;
  members: MemberProfileListItemDTO[];
  filterOptions: MemberProfileFilterOptionsDTO;
};

export function useMemberProfiles() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [filters, setFilters] = useState<MemberProfileFilters>({});
  const [data, setData] = useState<MemberProfilesApiValue | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const query = useMemo(() => buildMemberProfileQuery(filters), [filters]);

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/member-profiles${query ? `?${query}` : ""}`);
      const payload = await response.json();

      if (payload.ok) {
        setData(payload.value);
      }
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    clearFilters,
    isLoading,
    summary: data?.summary ?? null,
    members: data?.members ?? [],
    filterOptions: data?.filterOptions ?? { ministries: [] },
    refresh: fetchProfiles,
  };
}
