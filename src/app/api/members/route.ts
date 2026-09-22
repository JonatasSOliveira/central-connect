import { getApplication } from "@/composition/application";

export const { GET, POST } = getApplication().members.httpHandlers.members;
