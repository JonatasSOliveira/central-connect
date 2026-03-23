"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { MemberListItem } from "@/application/dtos/member/ListMembersDTO";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface UseMembersReturn {
  members: MemberListItem[];
  isLoading: boolean;
}

export function useMembers(): UseMembersReturn {
  const router = useRouter();
  const { user } = useAuth();
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
  }, [user, router]);

  return { members, isLoading };
}
