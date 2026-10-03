"use client";

import { PrivateHeader } from "@/components/modules/private-header";
import { CalendarView } from "@/features/calendar/components/CalendarView";

export default function CalendarPage() {
  return (
    <>
      <PrivateHeader title="Agenda" subtitle="Cultos e escalas" />
      <main className="min-h-0 w-full flex-1 overflow-hidden px-0 pb-0 pt-0">
        <CalendarView />
      </main>
    </>
  );
}
