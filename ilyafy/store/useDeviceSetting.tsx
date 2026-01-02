import { create } from 'zustand';
import { themeType } from '../types/components';
import ImageColors from 'react-native-image-colors';
import { Appearance } from 'react-native';
import { Track } from 'react-native-track-player';
import { ImageColorsResult } from 'react-native-image-colors/lib/typescript/types';
type deviceSettings = {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  colors: themeType;
  setColor: (arg: themeType) => void;
  loadColor: (track: Track | undefined) => void;
  networkSpeed: number | null;
  setNetworkSpeed: (arg: number | null) => void;
};
export default create<deviceSettings>((set, get) => ({
  theme: Appearance?.getColorScheme() === 'dark' ? 'dark' : 'light',
  setTheme: (arg: 'dark' | 'light') => {
    set({ theme: arg });
  },
  colors: {
    background: get()?.theme === 'dark' ? '#090F15' : '#E9E5DC',
    primary: '#262E36',
    secondary: get()?.theme === 'dark' ? '#B3B7BA' : '#E5DED2',
    text: get()?.theme === 'dark' ? '#E9E5DC' : '#010101',
    accent: '#6C6D74',
  },
  networkSpeed: null,
  setColor: (theme: themeType) => {
    set({ colors: theme });
  },
  loadColor: track => {
    const currentTrack = track;
    if (currentTrack) {
      ImageColors.getColors(
        currentTrack?.artwork || require('../assets/images/background.png'),
        {
          fallback: get().theme === 'dark' ? '#6C3E79' : '#FADADD',
          cache: true,
          key: currentTrack.id,
          quality: 'high',
          pixelSpacing: 5,
        },
      ).then((colors: ImageColorsResult) => {
        if (colors.platform === 'android') {
          get().setColor({
            background:
              get().theme === 'dark'
                ? colors?.darkMuted || '#6C3E79'
                : colors?.lightMuted || '#FADADD',
            primary: colors?.average || '#F4A9A8',
            secondary:
              get().theme === 'dark'
                ? colors?.darkVibrant || '#FADADD'
                : colors?.lightVibrant || '#6C3E79',
            text: get().theme === 'dark' ? '#FFFFFF' : '#6C3E79',
            accent: colors?.vibrant || '#F4A9A8',
          });
        } else if (colors.platform === 'ios') {
          get().setColor({
            background: colors.background,
            primary: colors.primary,
            secondary: colors.secondary,
            text: get().theme === 'dark' ? '#FFFFFF' : '#6C3E79',
            accent: colors.detail,
          });
        } else if (colors.platform === 'web') {
          get().setColor({
            background:
              colors?.dominant ||
              (get().theme === 'dark' ? '#6C3E79' : '#FADADD'),
            primary: colors?.vibrant || '#F4A9A8',
            secondary:
              colors?.lightVibrant ||
              (get().theme === 'dark' ? '#FADADD' : '#6C3E79'),
            text: get().theme === 'dark' ? '#FFFFFF' : '#6C3E79',
            accent: colors?.lightVibrant || '#F4A9A8',
          });
        }
      });
    }
  },
  setNetworkSpeed: arg => {
    console.log('Changing Network speed to', arg);
    set({ networkSpeed: arg });
  },
}));
