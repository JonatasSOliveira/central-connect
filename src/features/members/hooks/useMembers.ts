"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  MemberListItem,
  PaginationInfo,
} from "@/application/dtos/member/ListMembersDTO";
import { useAuthStore } from "@/stores/authStore";

interface UseMembersReturn {
  members: MemberListItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  total: number;
  search: string;
  setSearch: (search: string) => void;
  loadMore: () => void;
  refresh: () => void;
  deleteMember: (memberId: string) => Promise<boolean>;
}

const DEFAULT_LIMIT = 50;

export function useMembers(): UseMembersReturn {
  const user = useAuthStore((s) => s.user);
  const churchId = user?.churchId;

  const [members, setMembers] = useState<MemberListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [search, setSearch] = useState("");

  const currentPageRef = useRef(1);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFetchingRef = useRef(false);

  const fetchMembers = useCallback(
    async (isInitial: boolean, sid: string, s: string, page: number) => {
      if (!sid || isFetchingRef.current) return;

      isFetchingRef.current = true;

      if (isInitial) {
        setIsLoading(true);
        currentPageRef.current = 1;
      } else {
        setIsLoadingMore(true);
      }

      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      try {
        const params = new URLSearchParams({
          churchId: sid,
          page: String(page),
          limit: String(DEFAULT_LIMIT),
        });
        if (s) {
          params.append("search", s);
        }

        const response = await fetch(`/api/members?${params}`, {
          signal: abortControllerRef.current.signal,
        });
        const data = await response.json();

        if (data.ok) {
          const newMembers = data.value.members as MemberListItem[];
          const newPagination = data.value.pagination as PaginationInfo;

          if (isInitial) {
            setMembers(newMembers);
            currentPageRef.current = 1;
          } else {
            setMembers((prev) => [...prev, ...newMembers]);
            currentPageRef.current = page;
          }
          setPagination(newPagination);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error fetching members:", error);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [],
  );

  const debouncedSearch = useCallback((s: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setSearch(s);
    }, 300);
  }, []);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && pagination?.hasMore && churchId) {
      fetchMembers(false, churchId, search, currentPageRef.current + 1);
    }
  }, [isLoadingMore, pagination?.hasMore, churchId, search, fetchMembers]);

  const refresh = useCallback(() => {
    if (churchId) {
      setMembers([]);
      setPagination(null);
      currentPageRef.current = 1;
      fetchMembers(true, churchId, search, 1);
    }
  }, [churchId, search, fetchMembers]);

  useEffect(() => {
    if (!churchId) {
      setIsLoading(false);
      return;
    }

    setMembers([]);
    setPagination(null);
    currentPageRef.current = 1;
    fetchMembers(true, churchId, search, 1);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [churchId, search, fetchMembers]);

  const deleteMember = useCallback(
    async (memberId: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/members/${memberId}`, {
          method: "DELETE",
        });

        if (response.status === 204 || response.ok) {
          setMembers((prev) => prev.filter((m) => m.id !== memberId));
          setPagination((prev) =>
            prev ? { ...prev, total: prev.total - 1 } : null,
          );
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
    members,
    isLoading,
    isLoadingMore,
    hasMore: pagination?.hasMore ?? false,
    total: pagination?.total ?? 0,
    search,
    setSearch: debouncedSearch,
    loadMore,
    refresh,
    deleteMember,
  };
}
