"use client";

import FullCalendar from "@fullcalendar/react";
import type { CalendarRef, DatesSetInfo, DayCellInfo } from "@fullcalendar/react";
import classicThemePlugin from "@fullcalendar/react/themes/classic";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import listPlugin from "@fullcalendar/react/list";
import ptBrLocale from "@fullcalendar/react/locales/pt-br";
import { useRef, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { CalendarEmptyState } from "@/features/calendar/components/CalendarEmptyState";
import { CalendarEventContent } from "@/features/calendar/components/CalendarEventContent";
import { CalendarPanel, type PanelState } from "@/features/calendar/components/CalendarPanel";
import { CalendarToolbar } from "@/features/calendar/components/CalendarToolbar";
import { toCalendarEvents } from "@/features/calendar/utils/calendar-events";
import { formatCalendarPeriodLabel } from "@/features/calendar/utils/calendar-period-label";
import { useServices } from "@/features/services/hooks/useServices";
import { formatServiceDate } from "@/features/services/utils/service-date";
import { Permission } from "@/shared/domain/enums/Permission";
import styles from "./CalendarView.module.css";

export function CalendarView() {
  const calendarRef = useRef<CalendarRef>(null);
  const [title, setTitle] = useState("Calendário");
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [panel, setPanel] = useState<PanelState>({ mode: "closed" });
  const { user } = useAuth();
  const { services, applyFilters, refresh, deleteService } = useServices();
  const canCreateService = Boolean(
    user?.isSuperAdmin || user?.permissions.includes(Permission.SERVICE_WRITE),
  );
  const canViewScales = Boolean(
    user?.isSuperAdmin ||
      user?.permissions.includes(Permission.SCALE_READ) ||
      user?.permissions.includes(Permission.SCALE_SELF_READ),
  );
  const canReadScales = Boolean(
    user?.isSuperAdmin || user?.permissions.includes(Permission.SCALE_READ),
  );
  const canDeleteService = Boolean(
    user?.isSuperAdmin || user?.permissions.includes(Permission.SERVICE_DELETE),
  );
  const canWriteScales = Boolean(
    user?.isSuperAdmin || user?.permissions.includes(Permission.SCALE_WRITE),
  );
  const canDeleteScales = Boolean(
    user?.isSuperAdmin || user?.permissions.includes(Permission.SCALE_DELETE),
  );

  const openCreateService = (date?: string) => {
    const nextDate = date ?? formatServiceDate(new Date());
    setPanel({ mode: "create-service", date: nextDate });
  };

  const openDetails = (serviceId: string) => {
    setPanel({ mode: "service-details", serviceId });
  };

  const handleDatesSet = (info: DatesSetInfo) => {
    setTitle(
      formatCalendarPeriodLabel(
        info.view.type,
        info.view.currentStart,
        info.view.currentEnd,
      ),
    );
    setCurrentView(info.view.type);
    const endDate = new Date(info.end);
    endDate.setDate(endDate.getDate() - 1);
    applyFilters(info.start, endDate);
  };

  const eventVariant =
    currentView === "dayGridMonth"
      ? "month"
      : currentView === "dayGridWeek"
        ? "week"
        : currentView === "dayGridDay"
          ? "day"
          : "list";
  const getCalendarApi = () => calendarRef.current?.getApi();
  const getDayCellClass = (info: DayCellInfo) =>
    [
      info.isToday ? styles.dayToday : info.isOther ? styles.dayOther : "",
      canCreateService ? styles.dayClickable : "",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <section className={styles.wrapper} aria-label="Calendário de cultos e escalas">
      <CalendarToolbar
        title={title}
        currentView={currentView}
        onPrevious={() => getCalendarApi()?.prev()}
        onNext={() => getCalendarApi()?.next()}
        onToday={() => getCalendarApi()?.today()}
        onChangeView={(view) => getCalendarApi()?.changeView(view)}
        onCreateService={canCreateService ? () => openCreateService() : undefined}
      />
      <FullCalendar
        ref={calendarRef}
        className={styles.calendar}
        plugins={[classicThemePlugin, dayGridPlugin, interactionPlugin, listPlugin]}
        locales={[ptBrLocale]}
        locale="pt-br"
        initialView="dayGridMonth"
        headerToolbar={false}
        events={toCalendarEvents(services)}
        eventContent={(info) => (
          <CalendarEventContent
            title={info.event.title}
            time={info.event.extendedProps.time}
            location={info.event.extendedProps.location}
            variant={eventVariant}
          />
        )}
        eventClass={(_info) =>
          [styles.serviceEvent, canCreateService ? styles.serviceEventInteractive : ""]
            .filter(Boolean)
            .join(" ")
        }
        eventClick={(info) => openDetails(info.event.id)}
        dateClick={(info) => openCreateService(info.dateStr.slice(0, 10))}
        height="100%"
        fixedWeekCount={false}
        dayMaxEvents={currentView === "dayGridMonth" ? 3 : false}
        datesSet={handleDatesSet}
        dayCellClass={getDayCellClass}
        dayCellTopInnerClass={(info) =>
          info.isToday ? styles.dayNumberToday : styles.dayNumber
        }
        dayHeaderClass={(info) => (info.isToday ? styles.timeHeaderToday : styles.timeHeader)}
        dayLaneClass={(info) => (info.isToday ? styles.timeLaneToday : styles.timeLane)}
        slotLaneClass={styles.timeSlot}
        noEventsContent={() => <CalendarEmptyState viewType={currentView} />}
        editable={false}
        selectable={false}
        eventStartEditable={false}
        eventDurationEditable={false}
      />
      <CalendarPanel
        panel={panel}
        setPanel={setPanel}
        services={services}
        canCreateService={canCreateService}
        canDeleteService={canDeleteService}
        canViewScales={canViewScales}
        canReadScales={canReadScales}
        canWriteScales={canWriteScales}
        canDeleteScales={canDeleteScales}
        refreshServices={refresh}
        deleteService={deleteService}
      />
    </section>
  );
}
