"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Permission } from "@/domain/enums/Permission";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  getScaleAttendance,
  publishScaleAttendance,
  saveScaleAttendance,
} from "../services/scaleAttendanceApi";
import type {
  AttendanceMemberStatus,
  ScaleAttendanceDetail,
  ScaleAttendanceEntry,
} from "../types";

interface UseScaleAttendanceScreenInput {
  scaleId: string;
}

type EditableEntry = ScaleAttendanceEntry & { justificationDraft: string };

function toEditableEntries(entries: ScaleAttendanceEntry[]): EditableEntry[] {
  return entries.map((entry) => ({
    ...entry,
    justificationDraft: entry.justification ?? "",
  }));
}

function getEntriesSignature(entries: EditableEntry[]): string {
  const normalized = [...entries]
    .map((entry) => ({
      scaleMemberId: entry.scaleMemberId,
      status: entry.status,
      justification:
        entry.status === "absent_excused"
          ? entry.justificationDraft.trim()
          : "",
    }))
    .sort((a, b) => a.scaleMemberId.localeCompare(b.scaleMemberId));

  return JSON.stringify(normalized);
}

function getMissingJustificationIds(entries: EditableEntry[]): string[] {
  return entries
    .filter(
      (entry) =>
        entry.status === "absent_excused" && !entry.justificationDraft.trim(),
    )
    .map((entry) => entry.scaleMemberId);
}

function canEditNow(
  status: "draft" | "published",
  canWriteDraft: boolean,
  canWriteAnytime: boolean,
): boolean {
  return status === "draft"
    ? canWriteDraft || canWriteAnytime
    : canWriteAnytime;
}

export function useScaleAttendanceScreen({
  scaleId,
}: UseScaleAttendanceScreenInput) {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<ScaleAttendanceDetail | null>(
    null,
  );
  const [entries, setEntries] = useState<EditableEntry[]>([]);
  const [savedEntriesSignature, setSavedEntriesSignature] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const canWriteDraft =
    user?.isSuperAdmin ||
    user?.permissions.includes(Permission.SCALE_ATTENDANCE_WRITE_DRAFT) ||
    user?.permissions.includes(Permission.SCALE_WRITE) ||
    false;
  const canWriteAnytime =
    user?.isSuperAdmin ||
    user?.permissions.includes(Permission.SCALE_ATTENDANCE_WRITE_ANYTIME) ||
    false;
  const canPublish =
    user?.isSuperAdmin ||
    user?.permissions.includes(Permission.SCALE_ATTENDANCE_PUBLISH) ||
    user?.permissions.includes(Permission.SCALE_WRITE) ||
    false;

  const loadAttendance = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getScaleAttendance(scaleId);
      const mappedEntries = toEditableEntries(result.entries);
      setAttendance(result);
      setEntries(mappedEntries);
      setSavedEntriesSignature(getEntriesSignature(mappedEntries));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao carregar chamada";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [scaleId]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const canEdit = useMemo(() => {
    if (!attendance) return false;
    if (attendance.status === "published") return false;
    return canEditNow(attendance.status, canWriteDraft, canWriteAnytime);
  }, [attendance, canWriteDraft, canWriteAnytime]);

  const hasPendingChanges = useMemo(() => {
    return getEntriesSignature(entries) !== savedEntriesSignature;
  }, [entries, savedEntriesSignature]);

  const missingJustificationIds = useMemo(
    () => getMissingJustificationIds(entries),
    [entries],
  );

  const hasMissingJustifications = missingJustificationIds.length > 0;

  const markStatus = useCallback(
    (scaleMemberId: string, status: AttendanceMemberStatus) => {
      if (!canEdit) return;

      setEntries((current) =>
        current.map((entry) => {
          if (entry.scaleMemberId !== scaleMemberId) return entry;
          return {
            ...entry,
            status,
            justificationDraft:
              status === "absent_excused" ? entry.justificationDraft : "",
          };
        }),
      );
    },
    [canEdit],
  );

  const updateJustification = useCallback(
    (scaleMemberId: string, value: string) => {
      if (!canEdit) return;

      setEntries((current) =>
        current.map((entry) =>
          entry.scaleMemberId === scaleMemberId
            ? { ...entry, justificationDraft: value }
            : entry,
        ),
      );
    },
    [canEdit],
  );

  const save = useCallback(async () => {
    if (!canEdit) return;

    if (hasMissingJustifications) {
      toast.error(
        "Preencha a justificativa de todos os membros com falta justificada.",
      );
      return;
    }

    setIsSaving(true);
    try {
      const payload = entries
        .filter((entry) => entry.status !== "pending")
        .map((entry) => ({
          scaleMemberId: entry.scaleMemberId,
          status: entry.status as
            | "present"
            | "absent_unexcused"
            | "absent_excused",
          justification: entry.justificationDraft.trim() || undefined,
        }));

      const result = await saveScaleAttendance(scaleId, payload);
      const mappedEntries = toEditableEntries(result.entries);
      setAttendance(result);
      setEntries(mappedEntries);
      setSavedEntriesSignature(getEntriesSignature(mappedEntries));
      toast.success("Chamada salva com sucesso");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao salvar chamada";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }, [canEdit, entries, hasMissingJustifications, scaleId]);

  const publish = useCallback(async () => {
    if (!canPublish) return;

    setIsPublishing(true);
    try {
      const result = await publishScaleAttendance(scaleId);
      const mappedEntries = toEditableEntries(result.entries);
      setAttendance(result);
      setEntries(mappedEntries);
      setSavedEntriesSignature(getEntriesSignature(mappedEntries));
      toast.success("Chamada publicada com sucesso");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao publicar chamada";
      toast.error(message);
    } finally {
      setIsPublishing(false);
    }
  }, [canPublish, scaleId]);

  const summary = useMemo(() => {
    const present = entries.filter(
      (entry) => entry.status === "present",
    ).length;
    const absentUnexcused = entries.filter(
      (entry) => entry.status === "absent_unexcused",
    ).length;
    const absentExcused = entries.filter(
      (entry) => entry.status === "absent_excused",
    ).length;
    const pending = entries.filter(
      (entry) => entry.status === "pending",
    ).length;

    return { present, absentUnexcused, absentExcused, pending };
  }, [entries]);

  return {
    attendance,
    entries,
    summary,
    isLoading,
    isSaving,
    isPublishing,
    hasPendingChanges,
    hasMissingJustifications,
    missingJustificationIds,
    canEdit,
    canPublish,
    markStatus,
    updateJustification,
    save,
    publish,
    refresh: loadAttendance,
  };
}
