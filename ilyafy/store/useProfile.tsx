import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { profile } from '../types/components';
type profileProp = {
  profile: profile | null;
  email: string | null;
  name: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAccessToken: (arg: string) => void;
  setRefreshToken: (arg: string) => void;
  setName: (arg: string) => void;
  setEmail: (arg: string) => void;
  setProfile: (arg: profile | null) => Promise<void>;
};
export default create(
  persist<profileProp>(
    set => ({
      profile: null,
      email: null,
      name: null,
      accessToken: null,
      refreshToken: null,
      setEmail: arg => set({ email: arg }),
      setName: arg => set({ name: arg }),
      setAccessToken: arg => set({ accessToken: arg }),
      setRefreshToken: arg => set({ refreshToken: arg }),
      setProfile: async arg => {
        set({ profile: arg });
      },
    }),
    {
      name: 'profile',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
