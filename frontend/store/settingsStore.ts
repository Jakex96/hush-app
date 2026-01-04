import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@hush_settings';

interface SettingsState {
  allowExternalApps: boolean;
  setAllowExternalApps: (value: boolean) => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  allowExternalApps: false,

  setAllowExternalApps: async (value: boolean) => {
    console.log('[Settings] Setting allowExternalApps to:', value);
    set({ allowExternalApps: value });
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ allowExternalApps: value }));
      console.log('[Settings] Saved to AsyncStorage');
    } catch (error) {
      console.error('[Settings] Failed to save:', error);
    }
  },

  loadSettings: async () => {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (data) {
        const settings = JSON.parse(data);
        console.log('[Settings] Loaded from AsyncStorage:', settings);
        set({ allowExternalApps: settings.allowExternalApps ?? false });
      }
    } catch (error) {
      console.error('[Settings] Failed to load:', error);
    }
  },
}));
