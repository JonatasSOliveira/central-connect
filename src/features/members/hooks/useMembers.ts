"use client";

import { useEffect, useState } from "react";
import type { MemberListItem } from "@/application/dtos/member/ListMembersDTO";

interface UseMembersReturn {
  members: MemberListItem[];
  isLoading: boolean;
}

export function useMembers(): UseMembersReturn {
  const [members, setMembers] = useState<MemberListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
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
    };

    fetchMembers();
  }, []);

  return { members, isLoading };
}
