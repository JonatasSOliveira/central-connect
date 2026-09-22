import { getApplication } from "@/composition/application";

export const POST = getApplication().identity.httpHandlers.login;
