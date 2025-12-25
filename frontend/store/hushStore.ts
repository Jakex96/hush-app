import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HushState {
  isHushActive: boolean;
  endTime: number | null;
  duration: 'hour' | 'endOfDay' | null;
  setHushMode: (duration: 'hour' | 'endOfDay') => void;
  deactivateHush: () => void;
  loadState: () => Promise<void>;
}

export const useHushStore = create<HushState>((set, get) => ({
  isHushActive: false,
  endTime: null,
  duration: null,

  setHushMode: async (duration: 'hour' | 'endOfDay') => {
    const now = Date.now();
    let endTime: number;

    if (duration === 'hour') {
      // 1 hour from now
      endTime = now + 60 * 60 * 1000;
    } else {
      // Until end of day (midnight)
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      endTime = midnight.getTime();
    }

    set({ isHushActive: true, endTime, duration });

    // Persist to AsyncStorage
    await AsyncStorage.setItem(
      'hushState',
      JSON.stringify({ isHushActive: true, endTime, duration })
    );
  },

  deactivateHush: async () => {
    set({ isHushActive: false, endTime: null, duration: null });
    await AsyncStorage.removeItem('hushState');
  },

  loadState: async () => {
    try {
      const savedState = await AsyncStorage.getItem('hushState');
      if (savedState) {
        const { isHushActive, endTime, duration } = JSON.parse(savedState);
        
        // Check if the end time has passed
        if (endTime && Date.now() < endTime) {
          set({ isHushActive, endTime, duration });
        } else {
          // Clear expired state
          await AsyncStorage.removeItem('hushState');
        }
      }
    } catch (error) {
      console.error('Error loading HUSH state:', error);
    }
  },
}));