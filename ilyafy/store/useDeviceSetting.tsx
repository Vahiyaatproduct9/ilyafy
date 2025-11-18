import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';
import { StateStorage } from 'zustand/middleware';
import { theme } from '../types/components';
type deviceSettings = {
  theme: theme;
  setTheme: (theme: theme) => void;
};

const storage: StateStorage = {
  async getItem(name: string) {
    const item = await AsyncStorage.getItem(name);
    return item || '';
  },
  async setItem(name: string, value: string | object) {
    await AsyncStorage.setItem(
      name,
      typeof value === 'string' ? value : JSON.stringify(value),
    );
  },
  async removeItem(name) {
    await AsyncStorage.removeItem(name);
  },
};

export default create(
  persist<deviceSettings>(
    set => ({
      theme: 'dark' as const,
      setTheme: arg => {
        set({ theme: arg });
      },
    }),
    {
      name: 'device-settings',
      storage: createJSONStorage(() => storage),
    },
  ),
);
