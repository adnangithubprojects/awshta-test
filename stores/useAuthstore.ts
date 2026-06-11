import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type TAuthData = {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
};

type TAuthState = {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;

  setAuth: (payload: TAuthData) => void;
  logout: () => void;
};

export const useAuthStore = create<TAuthState>()(
  persist(
    (set) => ({
      access_token: undefined,
      refresh_token: undefined,
      token_type: undefined,

      setAuth: (payload) =>
        set(() => ({
          access_token: payload.access_token,
          refresh_token: payload.refresh_token,
          token_type: payload.token_type,
        })),

      logout: () =>
        set({
          access_token: undefined,
          refresh_token: undefined,
          token_type: undefined,
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
