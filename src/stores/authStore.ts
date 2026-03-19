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

interface AuthActions {
  login: (googleToken: string) => Promise<void>;
  logout: () => Promise<void>;
  selectChurch: (churchId: string) => Promise<void>;
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
    try {
      const result = await authService.login(googleToken);
      set({
        user: {
          userId: result.userId,
          memberId: result.memberId,
          email: result.email,
          fullName: result.fullName,
          avatarUrl: result.avatarUrl,
          isSuperAdmin: result.isSuperAdmin,
          churchId:
            result.churches.length === 1 ? result.churches[0].churchId : null,
        },
      });
    } finally {
      set({ isLoading: false });
    }
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

  selectChurch: async (churchId: string) => {
    set({ isLoading: true });
    try {
      await authService.selectChurch(churchId);
      set((state) => ({
        user: state.user ? { ...state.user, churchId } : null,
      }));
    } finally {
      set({ isLoading: false });
    }
  },
}));
