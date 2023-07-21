import { openDB } from "idb";

const DB_NAME = "notesDB";
const DB_VERSION = 1;
const NOTE_STORE = "notes";
const TAG_STORE = "tags";

export async function initializeIndexedDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(NOTE_STORE)) {
        db.createObjectStore(NOTE_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains(TAG_STORE)) {
        db.createObjectStore(TAG_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    },
  });

  return db;
}

export async function saveNotesToIndexedDB(notes: any[]) {
  const db = await initializeIndexedDB();

  const tx = db.transaction(NOTE_STORE, "readwrite");
  const noteStore = tx.objectStore(NOTE_STORE);

  const existingNotes = await noteStore.getAll();

  for (const note of notes) {
    if (existingNotes.some((existingNote) => existingNote.id === note.id)) {
      await noteStore.put(note);
    } else {
      await noteStore.add(note);
    }
  }

  await tx.done;
}

export async function deleteNoteFromIndexedDB(id: number) {
  const db = await initializeIndexedDB();

  const tx = db.transaction(NOTE_STORE, "readwrite");
  const noteStore = tx.objectStore(NOTE_STORE);

  await noteStore.delete(id);

  await tx.done;
}

export async function saveTagsToIndexedDB(tags: string[]) {
  const db = await initializeIndexedDB();

  const tx = db.transaction(TAG_STORE, "readwrite");
  const tagStore = tx.objectStore(TAG_STORE);

  const existingTags = await tagStore.getAll();

  for (const tag of tags) {
    if (!existingTags.some((existingTag) => existingTag.name === tag)) {
      console.log(tag);
      await tagStore.add({ name: tag });
    }
  }

  await tx.done;
}

export async function loadTagsFromIndexedDB() {
  const db = await initializeIndexedDB();

  const tx = db.transaction(TAG_STORE, "readonly");
  const tagStore = tx.objectStore(TAG_STORE);

  const tags = await tagStore.getAll();

  await tx.done;
  console.log(tags);
  return tags.map((tag) => tag.name);
}

export async function loadNotesFromIndexedDB() {
  const db = await initializeIndexedDB();

  const tx = db.transaction(NOTE_STORE, "readonly");
  const store = tx.objectStore(NOTE_STORE);

  const notes = await store.getAll();

  await tx.done;
  console.log(notes);
  return notes;
}
