import { getApplication } from "@/composition/application";

export const { GET, POST } = getApplication().churches.httpHandlers.churches;
