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
import { useRef, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { CalendarEmptyState } from "@/features/calendar/components/CalendarEmptyState";
import { CalendarEventContent } from "@/features/calendar/components/CalendarEventContent";
import { CalendarDaySummary, servicesForDate } from "@/features/calendar/components/CalendarDaySummary";
import { CalendarToolbar } from "@/features/calendar/components/CalendarToolbar";
import { toCalendarEvents } from "@/features/calendar/utils/calendar-events";
import { formatCalendarPeriodLabel } from "@/features/calendar/utils/calendar-period-label";
import { ServiceFormSheet } from "@/features/services/components/ServiceFormSheet";
import { useServices } from "@/features/services/hooks/useServices";
import { formatServiceDate } from "@/features/services/utils/service-date";
import { Permission } from "@/shared/domain/enums/Permission";
import styles from "./CalendarView.module.css";

export function CalendarView() {
  const calendarRef = useRef<CalendarRef>(null);
  const [title, setTitle] = useState("Calendário");
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [selectedDate, setSelectedDate] = useState<string>();
  const [selectedServiceId, setSelectedServiceId] = useState<string>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { user } = useAuth();
  const { services, applyFilters, refresh, deleteService } = useServices();
  const canCreateService =
    user?.isSuperAdmin || user?.permissions.includes(Permission.SERVICE_WRITE);

  const events = toCalendarEvents(services);

  const getCalendarApi = () => calendarRef.current?.getApi();
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

  const openCreateForm = (date?: string) => {
    setSelectedServiceId(undefined);
    setSelectedDate(date ?? formatServiceDate(new Date()));
    setIsFormOpen(true);
  };

  const openEditForm = (serviceId: string, date?: string) => {
    setSelectedServiceId(serviceId);
    if (date) setSelectedDate(date);
    setIsFormOpen(true);
  };

  const closeForm = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) setSelectedServiceId(undefined);
  };

  const selectedServices = selectedDate
    ? servicesForDate(services, selectedDate)
    : [];
  const eventVariant =
    currentView === "dayGridMonth"
      ? "month"
      : currentView === "dayGridWeek"
        ? "week"
        : currentView === "dayGridDay"
          ? "day"
          : "list";

  const getDayCellClass = (info: DayCellInfo) =>
    [
      info.isToday ? styles.dayToday : info.isOther ? styles.dayOther : "",
      canCreateService ? styles.dayClickable : "",
    ]
      .filter(Boolean)
      .join(" ");

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
        onCreateService={canCreateService ? () => openCreateForm() : undefined}
      />
      <FullCalendar
        ref={calendarRef}
        className={styles.calendar}
        plugins={[
          classicThemePlugin,
          dayGridPlugin,
          interactionPlugin,
          listPlugin,
        ]}
        locales={[ptBrLocale]}
        locale="pt-br"
        initialView="dayGridMonth"
        headerToolbar={false}
        events={events}
        eventContent={(info) => (
          <CalendarEventContent
            title={info.event.title}
            time={info.event.extendedProps.time}
            location={info.event.extendedProps.location}
            variant={eventVariant}
          />
        )}
        eventClass={(info) =>
          [
            styles.serviceEvent,
            canCreateService ? styles.serviceEventInteractive : "",
            selectedServiceId === info.event.id ? styles.serviceEventSelected : "",
          ]
            .filter(Boolean)
            .join(" ")
        }
        eventClick={
          (info) => {
            const date = info.event.startStr.slice(0, 10);
            if (canCreateService) openEditForm(info.event.id, date);
            else setSelectedDate(date);
          }
        }
        dateClick={(info) => setSelectedDate(info.dateStr.slice(0, 10))}
        height="100%"
        fixedWeekCount={false}
        dayMaxEvents={currentView === "dayGridMonth" ? 3 : false}
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
        noEventsContent={() => <CalendarEmptyState viewType={currentView} />}
        editable={false}
        selectable={false}
        eventStartEditable={false}
        eventDurationEditable={false}
      />
      {selectedDate && (
        <CalendarDaySummary
          date={selectedDate}
          services={selectedServices}
          canCreateService={Boolean(canCreateService)}
          onCreate={() => openCreateForm(selectedDate)}
          onEdit={(serviceId) => openEditForm(serviceId, selectedDate)}
        />
      )}
      <ServiceFormSheet
        open={isFormOpen}
        mode={selectedServiceId ? "edit" : "create"}
        serviceId={selectedServiceId}
        initialDate={selectedDate}
        onOpenChange={closeForm}
        onSuccess={() => {
          closeForm(false);
          void refresh();
        }}
        onDelete={deleteService}
      />
    </section>
  );
}
