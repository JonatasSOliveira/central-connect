"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { RoleListItem } from "@/application/dtos/role/ListRolesDTO";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface UseRolesReturn {
  roles: RoleListItem[];
  isLoading: boolean;
}

export function useRoles(): UseRolesReturn {
  const router = useRouter();
  const { user } = useAuth();
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && !user.isSuperAdmin) {
      router.push("/home");
      return;
    }

    if (!user) return;

    const fetchRoles = async () => {
      try {
        const response = await fetch("/api/roles");
        const data = await response.json();

        if (data.ok) {
          setRoles(data.value.roles);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, [user, router]);

  return { roles, isLoading };
}
