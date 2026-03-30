import { create } from "zustand";
import {
  authService,
  type CurrentUser,
} from "@/application/services/AuthService";

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
    try {
      const currentUser = await authService.getCurrentUser();
      set({ user: currentUser, isInitialized: true });
    } catch {
      set({ user: null, isInitialized: true });
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
      await authService.logout();
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));
