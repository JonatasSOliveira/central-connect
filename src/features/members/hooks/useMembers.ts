"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MemberListItem } from "@/application/dtos/member/ListMembersDTO";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function useMembersListScreen() {
  const { user } = useAuth();
  const churchId = user?.churchId ?? null;

  const [allMembers, setAllMembers] = useState<MemberListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMembers = useCallback(async () => {
    if (!churchId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/members`);
      const data = await response.json();

      if (data.ok) {
        setAllMembers(data.value.members as MemberListItem[]);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoading(false);
    }
  }, [churchId]);

  useEffect(() => {
    if (!churchId) {
      setAllMembers([]);
      setIsLoading(false);
      return;
    }

    fetchMembers();
  }, [churchId, fetchMembers]);

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) {
      return allMembers;
    }

    const query = searchQuery.toLowerCase().trim();
    return allMembers.filter((member) =>
      member.fullName.toLowerCase().includes(query),
    );
  }, [allMembers, searchQuery]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const deleteMember = useCallback(
    async (memberId: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/members/${memberId}`, {
          method: "DELETE",
        });

        if (response.status === 204 || response.ok) {
          setAllMembers((prev) => prev.filter((m) => m.id !== memberId));
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error deleting member:", error);
        return false;
      }
    },
    [],
  );

  return {
    members: filteredMembers,
    allMembersCount: allMembers.length,
    isLoading,
    searchQuery,
    setSearch: handleSearch,
    refresh: fetchMembers,
    deleteMember,
  };
}
