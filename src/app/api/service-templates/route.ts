import { getApplication } from "@/composition/application";

export const { GET, POST } =
  getApplication().serviceTemplates.httpHandlers.serviceTemplates;
