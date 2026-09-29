export interface AuthRouteInput {
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  churchId: string | null;
}

export type AuthenticatedRoute = "/login" | "/home" | "/select-church";

export function getAuthenticatedRoute({
  isAuthenticated,
  isSuperAdmin,
  churchId,
}: AuthRouteInput): AuthenticatedRoute {
  if (!isAuthenticated) {
    return "/login";
  }

  if (isSuperAdmin || churchId) {
    return "/home";
  }

  return "/select-church";
}
