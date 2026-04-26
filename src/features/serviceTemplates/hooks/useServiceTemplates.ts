"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";

export interface ServiceTemplateListItem {
  id: string;
  churchId: string;
  title: string;
  dayOfWeek: string;
  time: string;
  location: string | null;
  isActive: boolean;
}

export function useServiceTemplates() {
  const { user } = useAuth();
  const churchId = user?.churchId ?? null;

  const [templates, setTemplates] = useState<ServiceTemplateListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTemplates = useCallback(async () => {
    if (!churchId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/service-templates`);
      const data = await response.json();

      if (data.ok) {
        setTemplates(data.value.templates as ServiceTemplateListItem[]);
      }
    } catch (error) {
      console.error("Error fetching service templates:", error);
    } finally {
      setIsLoading(false);
    }
  }, [churchId]);

  useEffect(() => {
    if (!churchId) {
      setTemplates([]);
      setIsLoading(false);
      return;
    }

    fetchTemplates();
  }, [churchId, fetchTemplates]);

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) {
      return templates;
    }

    const query = searchQuery.toLowerCase().trim();
    return templates.filter(
      (template) =>
        template.title.toLowerCase().includes(query) ||
        template.dayOfWeek.toLowerCase().includes(query) ||
        template.location?.toLowerCase().includes(query),
    );
  }, [templates, searchQuery]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const deleteTemplate = useCallback(
    async (templateId: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/service-templates/${templateId}`, {
          method: "DELETE",
        });

        if (response.status === 204 || response.ok) {
          setTemplates((prev) => prev.filter((t) => t.id !== templateId));
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error deleting service template:", error);
        return false;
      }
    },
    [],
  );

  return {
    templates: filteredTemplates,
    allTemplatesCount: templates.length,
    isLoading,
    searchQuery,
    setSearch: handleSearch,
    refresh: fetchTemplates,
    deleteTemplate,
  };
}
