"use client";

import { useCallback, useEffect, useState } from "react";
import type { MemberListItem } from "@/application/dtos/member/ListMembersDTO";

interface UseMembersReturn {
  members: MemberListItem[];
  isLoading: boolean;
  deleteMember: (memberId: string) => Promise<boolean>;
  refresh: () => void;
}

export function useMembers(): UseMembersReturn {
  const [members, setMembers] = useState<MemberListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/members");
      const data = await response.json();

      if (data.ok) {
        setMembers(data.value.members);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const deleteMember = useCallback(
    async (memberId: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/members/${memberId}`, {
          method: "DELETE",
        });

        if (response.status === 204) {
          setMembers((prev) => prev.filter((m) => m.id !== memberId));
          return true;
        }

        const data = await response.json();

        if (data.ok) {
          setMembers((prev) => prev.filter((m) => m.id !== memberId));
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

  return { members, isLoading, deleteMember, refresh: fetchMembers };
}
