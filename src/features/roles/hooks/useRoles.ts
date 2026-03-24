"use client";

import { useCallback, useEffect, useState } from "react";
import type { RoleListItem } from "@/application/dtos/role/ListRolesDTO";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface UseRolesReturn {
  roles: RoleListItem[];
  isLoading: boolean;
  deleteRole: (roleId: string) => Promise<boolean>;
  refresh: () => void;
}

export function useRoles(): UseRolesReturn {
  const { user } = useAuth();
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoles = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
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
  }, [user]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const deleteRole = useCallback(async (roleId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: "DELETE",
      });

      if (response.status === 204) {
        setRoles((prev) => prev.filter((r) => r.id !== roleId));
        return true;
      }

      const data = await response.json();

      if (data.ok) {
        setRoles((prev) => prev.filter((r) => r.id !== roleId));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting role:", error);
      return false;
    }
  }, []);

  return { roles, isLoading, deleteRole, refresh: fetchRoles };
}
