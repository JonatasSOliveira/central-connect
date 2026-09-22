import { getApplication } from "@/composition/application";

export const { GET, POST } = getApplication().services.httpHandlers.services;
