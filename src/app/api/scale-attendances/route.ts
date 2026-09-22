import type { NextRequest } from "next/server";
import { getApplication } from "@/composition/application";

export async function GET(request: NextRequest) {
  return getApplication().scales.httpHandlers.attendance.list(request);
}
