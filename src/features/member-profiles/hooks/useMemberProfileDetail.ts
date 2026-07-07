"use client";

import { useCallback, useEffect, useState } from "react";
import type { MemberProfileDetailDTO } from "@/application/dtos/member-profile/MemberProfileDTO";

export function useMemberProfileDetail(memberId: string) {
  const [profile, setProfile] = useState<MemberProfileDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/member-profiles/${memberId}`);
      const payload = await response.json();

      if (payload.ok) {
        setProfile(payload.value);
      }
    } finally {
      setIsLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, isLoading, refresh: fetchProfile };
}
