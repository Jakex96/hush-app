import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@hush_settings';

export type BankOption = 
  | 'none'
  | 'revolut'
  | 'csob'
  | 'ceska_sporitelna'
  | 'komercni_banka'
  | 'air_bank'
  | 'moneta'
  | 'raiffeisenbank'
  | 'fio'
  | 'paypal';

interface SettingsState {
  allowExternalApps: boolean;
  selectedBank: BankOption;
  setAllowExternalApps: (value: boolean) => Promise<void>;
  setSelectedBank: (bank: BankOption) => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const bankOptions = [
  { value: 'none', label: 'None (not set)' },
  { value: 'revolut', label: 'Revolut' },
  { value: 'csob', label: 'ČSOB' },
  { value: 'ceska_sporitelna', label: 'Česká spořitelna' },
  { value: 'komercni_banka', label: 'Komerční banka' },
  { value: 'air_bank', label: 'Air Bank' },
  { value: 'moneta', label: 'Moneta' },
  { value: 'raiffeisenbank', label: 'Raiffeisenbank' },
  { value: 'fio', label: 'Fio' },
  { value: 'paypal', label: 'PayPal' },
] as const;

export const bankDeepLinks: Record<BankOption, string> = {
  none: '',
  revolut: 'revolut://',
  csob: 'csobsmartklic://',
  ceska_sporitelna: 'georgego://',
  komercni_banka: 'mojekb://',
  air_bank: 'airbank://',
  moneta: 'monetasmart://',
  raiffeisenbank: 'rbcz://',
  fio: 'fiosb://',
  paypal: 'paypal://',
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  allowExternalApps: false,
  selectedBank: 'none',

  setAllowExternalApps: async (value: boolean) => {
    console.log('[Settings] Setting allowExternalApps to:', value);
    set({ allowExternalApps: value });
    try {
      const currentSettings = { allowExternalApps: value, selectedBank: get().selectedBank };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings));
      console.log('[Settings] Saved to AsyncStorage');
    } catch (error) {
      console.error('[Settings] Failed to save:', error);
    }
  },

  setSelectedBank: async (bank: BankOption) => {
    console.log('[Settings] Setting selectedBank to:', bank);
    set({ selectedBank: bank });
    try {
      const currentSettings = { allowExternalApps: get().allowExternalApps, selectedBank: bank };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings));
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
        set({ 
          allowExternalApps: settings.allowExternalApps ?? false,
          selectedBank: settings.selectedBank ?? 'none'
        });
      }
    } catch (error) {
      console.error('[Settings] Failed to load:', error);
    }
  },
}));
