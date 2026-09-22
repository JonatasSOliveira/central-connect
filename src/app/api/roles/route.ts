import { getApplication } from "@/composition/application";

export const { GET, POST } = getApplication().roles.httpHandlers.roles;
