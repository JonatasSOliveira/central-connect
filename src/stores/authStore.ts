import { create } from "zustand";
import {
  authService,
  type CurrentUser,
} from "@/application/services/AuthService";
import { signOut as firebaseClientSignOut } from "@/infra/firebase-client/services/googleAuth";

interface AuthState {
  user: CurrentUser | null;
  isLoading: boolean;
  isInitialized: boolean;
}

interface LoginResult {
  errorMessage: string | null;
}

interface AuthActions {
  login: (googleToken: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    const redirectToLoginAndClearSession = async () => {
      set({ user: null, isInitialized: true });

      try {
        await authService.logout();
      } catch {
        // noop
      }

      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.replace("/login");
      }
    };

    try {
      const currentUser = await authService.getCurrentUser();

      if (!currentUser) {
        await redirectToLoginAndClearSession();
        return;
      }

      set({ user: currentUser, isInitialized: true });
    } catch {
      await redirectToLoginAndClearSession();
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (googleToken: string) => {
    set({ isLoading: true });

    const result = await authService.login(googleToken);

    if (!result.ok) {
      set({ isLoading: false });
      return { errorMessage: result.error.message };
    }

    set({
      user: {
        userId: result.value.userId,
        memberId: result.value.memberId,
        email: result.value.email,
        fullName: result.value.fullName,
        avatarUrl: result.value.avatarUrl,
        isSuperAdmin: result.value.isSuperAdmin,
        churchId: result.value.churchId,
        churchName: result.value.churchName,
        churches: result.value.churches,
        permissions: result.value.permissions,
      },
      isLoading: false,
    });

    return { errorMessage: null };
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await Promise.allSettled([authService.logout(), firebaseClientSignOut()]);

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("google-login-pending");
        window.localStorage.removeItem("google-login-pending");
        window.localStorage.removeItem("google-login-pending-ts");
      }

      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));
