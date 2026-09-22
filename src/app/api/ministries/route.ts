import { getApplication } from "@/composition/application";

const handler = getApplication().ministries.httpHandlers.collection;

export function GET(request: Request): Promise<Response> {
  return handler.list(request);
}

export function POST(request: Request): Promise<Response> {
  return handler.create(request);
}
