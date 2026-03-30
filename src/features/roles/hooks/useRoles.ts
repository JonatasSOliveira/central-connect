"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { RoleListItem } from "@/application/dtos/role/ListRolesDTO";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface UseRolesReturn {
  roles: RoleListItem[];
  allRolesCount: number;
  isLoading: boolean;
  searchQuery: string;
  setSearch: (value: string) => void;
  deleteRole: (roleId: string) => Promise<boolean>;
  refresh: () => void;
}

export function useRoles(): UseRolesReturn {
  const { user } = useAuth();
  const [allRoles, setAllRoles] = useState<RoleListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRoles = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/roles");
      const data = await response.json();

      if (data.ok) {
        const sorted = [...data.value.roles].sort((a, b) =>
          a.name.localeCompare(b.name, "pt-BR"),
        );
        setAllRoles(sorted);
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

  const filteredRoles = useMemo(() => {
    if (!searchQuery.trim()) {
      return allRoles;
    }
    const query = searchQuery.toLowerCase().trim();
    return allRoles.filter((role) => role.name.toLowerCase().includes(query));
  }, [allRoles, searchQuery]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const deleteRole = useCallback(async (roleId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: "DELETE",
      });

      if (response.status === 204) {
        setAllRoles((prev) => prev.filter((r) => r.id !== roleId));
        return true;
      }

      const data = await response.json();

      if (data.ok) {
        setAllRoles((prev) => prev.filter((r) => r.id !== roleId));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting role:", error);
      return false;
    }
  }, []);

  return {
    roles: filteredRoles,
    allRolesCount: allRoles.length,
    isLoading,
    searchQuery,
    setSearch: handleSearch,
    deleteRole,
    refresh: fetchRoles,
  };
}
