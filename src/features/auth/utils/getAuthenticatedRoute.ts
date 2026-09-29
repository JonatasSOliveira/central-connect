export interface AuthRouteInput {
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  churchId: string | null;
  hasChurches: boolean;
}

export type AuthenticatedRoute = "/login" | "/home" | "/select-church";

export function getAuthenticatedRoute({
  isAuthenticated,
  isSuperAdmin,
  churchId,
  hasChurches,
}: AuthRouteInput): AuthenticatedRoute {
  if (!isAuthenticated) {
    return "/login";
  }

  if (churchId) {
    return "/home";
  }

  if (isSuperAdmin && !hasChurches) {
    return "/home";
  }

  return "/select-church";
}
