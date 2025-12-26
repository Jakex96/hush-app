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

      console.log('[NotesStore] Adding new note:', newNote.id);
      const updatedNotes = [newNote, ...get().notes];
      set({ notes: updatedNotes });
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
      console.log('[NotesStore] Note added and persisted. Total notes:', updatedNotes.length);
    } catch (error) {
      console.error('[NotesStore] Error adding note:', error);
    }
  },

  updateNote: async (id, updates) => {
    try {
      console.log('[NotesStore] Updating note:', id);
      const updatedNotes = get().notes.map((note) =>
        note.id === id ? { ...note, ...updates } : note
      );
      set({ notes: updatedNotes });
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
      console.log('[NotesStore] Note updated and persisted');
    } catch (error) {
      console.error('[NotesStore] Error updating note:', error);
    }
  },

  deleteNote: async (id: string) => {
    try {
      console.log('[NotesStore] DELETE START - ID:', id);
      const currentNotes = get().notes;
      console.log('[NotesStore] DELETE - Current notes count:', currentNotes.length);
      
      // Filter out the note with matching ID
      const updatedNotes = currentNotes.filter((note) => note.id !== id);
      console.log('[NotesStore] DELETE - After filter:', updatedNotes.length);
      
      // Update state FIRST (triggers immediate re-render)
      set({ notes: updatedNotes });
      console.log('[NotesStore] DELETE - State updated');
      
      // THEN persist to storage
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
      console.log('[NotesStore] DELETE - Persisted to storage');
    } catch (error) {
      console.error('[NotesStore] DELETE ERROR:', error);
      throw error;
    }
  },

  getNote: (id) => {
    return get().notes.find((note) => note.id === id);
  },
}));
