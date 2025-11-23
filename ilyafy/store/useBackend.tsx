import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type backendProp = {
  backend: string | null;
  setBackend: (url: string) => void;
};

export default create(
  persist<backendProp>(
    set => ({
      backend: null,
      setBackend: url => {
        set({ backend: url });
      },
    }),
    {
      name: 'backend',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
