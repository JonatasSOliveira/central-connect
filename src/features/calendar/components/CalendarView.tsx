"use client";

import FullCalendar from "@fullcalendar/react";
import type {
  CalendarRef,
  DatesSetInfo,
  DayCellInfo,
} from "@fullcalendar/react";
import classicThemePlugin from "@fullcalendar/react/themes/classic";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import listPlugin from "@fullcalendar/react/list";
import ptBrLocale from "@fullcalendar/react/locales/pt-br";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import { useEffect, useRef, useState } from "react";
import { CalendarToolbar } from "@/features/calendar/components/CalendarToolbar";
import { CalendarEmptyState } from "@/features/calendar/components/CalendarEmptyState";
import styles from "./CalendarView.module.css";

export function CalendarView() {
  const calendarRef = useRef<CalendarRef>(null);
  const [title, setTitle] = useState("Calendário");
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [calendarHeight, setCalendarHeight] = useState("auto");
  const events: never[] = [];

  useEffect(() => {
    const updateCalendarHeight = () => {
      if (window.innerWidth <= 640) {
        setCalendarHeight("auto");
        return;
      }

      setCalendarHeight(
        window.innerWidth <= 1023
          ? "calc(100dvh - 245px)"
          : "calc(100dvh - 230px)",
      );
    };

    updateCalendarHeight();
    window.addEventListener("resize", updateCalendarHeight);

    return () => window.removeEventListener("resize", updateCalendarHeight);
  }, []);

  const getCalendarApi = () => calendarRef.current?.getApi();
  const handleDatesSet = (info: DatesSetInfo) => {
    setTitle(info.view.title);
    setCurrentView(info.view.type);
  };

  const getDayCellClass = (info: DayCellInfo) =>
    info.isToday ? styles.dayToday : info.isOther ? styles.dayOther : "";

  const getDayNumberClass = (info: DayCellInfo) =>
    info.isToday ? styles.dayNumberToday : styles.dayNumber;

  return (
    <section
      className={styles.wrapper}
      aria-label="Calendário de cultos e escalas"
    >
      <CalendarToolbar
        title={title}
        currentView={currentView}
        onPrevious={() => getCalendarApi()?.prev()}
        onNext={() => getCalendarApi()?.next()}
        onToday={() => getCalendarApi()?.today()}
        onChangeView={(view) => getCalendarApi()?.changeView(view)}
      />
      <FullCalendar
        ref={calendarRef}
        className={styles.calendar}
        plugins={[
          classicThemePlugin,
          dayGridPlugin,
          interactionPlugin,
          listPlugin,
          timeGridPlugin,
        ]}
        locales={[ptBrLocale]}
        locale="pt-br"
        initialView="dayGridMonth"
        headerToolbar={false}
        events={events}
        height={calendarHeight}
        fixedWeekCount={false}
        dayMaxEvents={3}
        datesSet={handleDatesSet}
        dayCellClass={getDayCellClass}
        dayCellTopInnerClass={getDayNumberClass}
        dayHeaderClass={(info) =>
          info.isToday ? styles.timeHeaderToday : styles.timeHeader
        }
        dayLaneClass={(info) =>
          info.isToday ? styles.timeLaneToday : styles.timeLane
        }
        slotLaneClass={styles.timeSlot}
        noEventsContent={() => <CalendarEmptyState />}
        editable={false}
        selectable={false}
        eventStartEditable={false}
        eventDurationEditable={false}
      />
    </section>
  );
}
