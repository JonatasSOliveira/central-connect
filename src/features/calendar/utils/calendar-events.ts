import type { ServiceListItem } from "@/features/services/hooks/useServices";
import { getServiceDatePart } from "@/features/services/utils/service-date";

export function toCalendarEvents(services: ServiceListItem[]) {
  return [...services]
    .sort((first, second) => {
      const dateComparison = first.date.localeCompare(second.date);
      return dateComparison || first.time.localeCompare(second.time);
    })
    .map((service) => ({
      id: service.id,
      title: service.title,
      start: `${getServiceDatePart(service.date)}T${service.time}`,
      extendedProps: {
        time: service.time,
        location: service.location,
        description: service.description,
      },
    }));
}
