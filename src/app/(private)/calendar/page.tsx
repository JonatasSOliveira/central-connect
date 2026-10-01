"use client";

import { PrivateHeader } from "@/components/modules/private-header";
import { CalendarView } from "@/features/calendar/components/CalendarView";

export default function CalendarPage() {
  return (
    <>
      <PrivateHeader title="Agenda" subtitle="Cultos e escalas" />
      <main className="w-full px-0 pt-4 pb-8 md:pt-6">
        <CalendarView />
      </main>
    </>
  );
}
