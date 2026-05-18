import { TUser } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type TAuthStore = {
  user: TPublicUser | null;
  isAuthenticated: boolean;
  setAuth: (user: TPublicUser) => void;
  clearAuth: () => void;
};

type TPublicUser = Omit<TUser, "password" | "otp">;

export const useAuthStore = create<TAuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user) => set({ user, isAuthenticated: true }),
      clearAuth: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
