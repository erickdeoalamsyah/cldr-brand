"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserRole = "USER" | "ADMIN";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

type AuthPayload = {
  user: User;
  token: string;
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean; // Track hydration status
  setHasHydrated: (state: boolean) => void;
  setAuth: (payload: AuthPayload) => void;
  clearAuth: () => void;
  logout: () => void;
}

const STORAGE_KEY = "clrd_auth";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      setAuth: (payload) => {
        set({
          user: payload.user,
          token: payload.token,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);