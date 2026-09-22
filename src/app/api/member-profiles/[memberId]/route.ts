import type { NextRequest } from "next/server";
import { getApplication } from "@/composition/application";

const handler = getApplication().memberProfiles.httpHandlers.memberProfile;
interface RouteParams {
  params: Promise<{ memberId: string }>;
}
export async function GET(request: NextRequest, { params }: RouteParams) {
  return handler(request, (await params).memberId);
}
