import { TUser } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type TAuthStore = {
  user: TPublicUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: TPublicUser, token: string, refreshToken: string) => void;
  clearAuth: () => void;
};

type TPublicUser = Omit<TUser, "password" | "otp">;

export const useAuthStore = create<TAuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, token, refreshToken) =>
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        }),
      // setAuth: (user) => set({ user, isAuthenticated: true }),

      clearAuth: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
