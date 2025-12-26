import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NoteTag = 'quick' | 'idea' | 'urgent';

export interface Note {
  id: string;
  title?: string;
  body: string;
  timestamp: number;
  photoUri?: string; // base64 or local URI
  tags: NoteTag[];
}

interface NotesState {
  notes: Note[];
  loadNotes: () => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'timestamp'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNote: (id: string) => Note | undefined;
}

const NOTES_STORAGE_KEY = '@hush_notes';

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],

  loadNotes: async () => {
    try {
      const savedNotes = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (savedNotes) {
        const notes = JSON.parse(savedNotes);
        set({ notes });
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  },

  addNote: async (noteData) => {
    try {
      const newNote: Note = {
        ...noteData,
        id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      const updatedNotes = [newNote, ...get().notes];
      set({ notes: updatedNotes });
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
    } catch (error) {
      console.error('Error adding note:', error);
    }
  },

  updateNote: async (id, updates) => {
    try {
      const updatedNotes = get().notes.map((note) =>
        note.id === id ? { ...note, ...updates } : note
      );
      set({ notes: updatedNotes });
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
    } catch (error) {
      console.error('Error updating note:', error);
    }
  },

  deleteNote: async (id) => {
    try {
      const updatedNotes = get().notes.filter((note) => note.id !== id);
      set({ notes: updatedNotes });
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  },

  getNote: (id) => {
    return get().notes.find((note) => note.id === id);
  },
}));
