import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { saveNotesToIndexedDB, loadNotesFromIndexedDB } from "../indexedDB";

interface Note {
  id: number;
  text: string;
  tags?: string[];
}

interface NotesState {
  notes: Note[];
}

const initialState: NotesState = {
  notes: [],
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    setNotes: (state, action: PayloadAction<Note[]>) => {
      state.notes = action.payload;
    },
    addNote: (state, action: PayloadAction<Note>) => {
      console.log(action.payload);
      state.notes.push(action.payload);
    },
    editNote: (state, action: PayloadAction<Note>) => {
      console.log(action.payload);
      const { id, text } = action.payload;
      const existingNote: any = state.notes.find((note) => note.id === id);
      const tags: any = action.payload.tags || [];
      if (existingNote) {
        existingNote.text = text;
        if (existingNote.tags) {
          const uniqueTags = new Set<string>([...existingNote.tags, ...tags]);
          existingNote.tags = Array.from(uniqueTags);
        } else {
          existingNote.tags = tags;
        }
      }
    },
    deleteNote: (state, action: PayloadAction<number>) => {
      state.notes = state.notes.filter((note) => note.id !== action.payload);
    },
  },
});

export const { addNote, editNote, deleteNote, setNotes } = notesSlice.actions;

export default notesSlice.reducer;
