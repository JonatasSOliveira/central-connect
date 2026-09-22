import { getApplication } from "@/composition/application";

export const GET = getApplication().identity.httpHandlers.me;
