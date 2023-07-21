import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Input, Button, List, Tag, Space, Checkbox } from 'antd';
import './index.scss';
import { addNote, deleteNote, editNote, setNotes } from './redux/notesSlice';
import { addTag, setTags } from './redux/tagsSlice';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { deleteNoteFromIndexedDB, loadNotesFromIndexedDB, loadTagsFromIndexedDB, saveNotesToIndexedDB, saveTagsToIndexedDB } from './indexedDB';

const { TextArea } = Input;

const Notes: React.FC = () => {
   const [newNote, setNewNote] = useState<string>('');
   const [newTag, setNewTag] = useState<string>('');
   const [filteredTags, setFilteredTags] = useState<string[]>([]);
   const [highlightedText, setHighlightedText] = useState<any>('');
   const [selectedTags, setSelectedTags] = useState<string[]>([]); 
   const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
   const [editedNoteText, setEditedNoteText] = useState<string>('');

   const notes = useSelector((state: any) => state.notes.notes);
   const tags = useSelector((state: any) => state.tags.tags);
   const dispatch = useDispatch();

   const handleNoteTextEdit = (e: React.FormEvent<HTMLDivElement>) => {
      const editedText = e.currentTarget.textContent || '';
      setEditedNoteText(editedText);
   };

   const deleteNoteFromDB = async (id: number) => {
      try {
         await deleteNoteFromIndexedDB(id);
      } catch (error) {
         console.error('Error deleting note from IndexedDB:', error);
      }
   };
   const saveNotesToDB = async (notes: any[]) => {
      try {
         await saveNotesToIndexedDB(notes);
         console.log('Notes saved to IndexedDB');
      } catch (error) {
         console.error('Error saving notes to IndexedDB:', error);
      }
   };

   const saveTagsToDB = async (tags: string[]) => {
      try {
         await saveTagsToIndexedDB(tags);
         console.log('tags saved to IndexedDB');
      } catch (error) {
         console.error('Error saving tags to IndexedDB:', error);
      }
   };


   useEffect(() => {
      saveNotesToDB(notes);
   }, [notes]);

   useEffect(() => {
      saveTagsToDB(tags)
   }, [tags])
   useEffect(() => {
      const loadTags = async () => {
         try {
            const savedTags = await loadTagsFromIndexedDB();
            dispatch(setTags(savedTags));
         } catch (error) {
            console.error('Error loading tags from IndexedDB:', error);
         }
      };
      loadTags();
   }, []);

   useEffect(() => {
      const loadNotes = async () => {
         try {
            const savedNotes = await loadNotesFromIndexedDB();
            dispatch(setNotes(savedNotes));
         } catch (error) {
            console.error('Error loading notes from IndexedDB:', error);
         }
      };
      loadNotes();
   }, []);



   const extractTagsFromText = (text: string): string[] => {
      const tags = text.match(/#\w+/g) || [];
      return tags.map((tag) => tag.substring(1));
   };

   const handleAddNote = () => {
      const noteText = newNote.trim();
      if (noteText) {
         const noteTags = noteText.match(/#\w+/g) || [];
         dispatch(addNote({ id: Date.now(), text: noteText, tags: noteTags }));
         noteTags.forEach((tag) => {
            const tagText = tag.substring(1);
            if (!tags.includes(tagText)) {
               dispatch(addTag(tagText));
               setNewTag('');
            }
         });
         setNewNote('');
         setFilteredTags([]);
         setSelectedTags([]);
         setHighlightedText('');
      }
   };


   const handleEditSave = () => {
      const noteText = editedNoteText.trim();
      if (noteText) {
         const noteTags = noteText.match(/#\w+/g) || [];
         dispatch(editNote({ id: Number(editingNoteId), text: editedNoteText, tags: Array.from(noteTags) }));
         noteTags.forEach((tag) => {
            const tagText = tag.substring(1);
            if (!tags.includes(tagText)) {
               dispatch(addTag(tagText));
               setNewTag('');
            }
         });

         setEditingNoteId(null);
         setEditedNoteText('');
      };
   }




   const handleEditCancel = () => {
      setEditingNoteId(null);
      setEditedNoteText('');
      setSelectedTags([]);
   };

   const handleDeleteNote = (id: number) => {
      dispatch(deleteNote(id));
      deleteNoteFromDB(id);
   };



   const handleEditStart = (note: any) => {
      setEditingNoteId(note.id);
      setEditedNoteText(note.text);
      setSelectedTags(note.tags || []);
   };

   const handleTagClick = (tag: string) => {

      if (!tag.startsWith("#")) {
         tag = "#" + tag;
      }
      if (filteredTags.includes(tag)) {
         setFilteredTags(filteredTags.filter((t) => t !== tag));
      } else {
         setFilteredTags([...filteredTags, tag]);
      }

    
      if (selectedTags.includes(tag)) {
         setSelectedTags((prevSelectedTags) => prevSelectedTags.filter((t) => t !== tag));
      } else {
         setSelectedTags((prevSelectedTags) => [...prevSelectedTags, tag]);
      }
   };


   useEffect(() => {
      const highlightedTags = filteredTags.join('|');
      const regex = new RegExp(`(#(${highlightedTags}))`, 'g');
      const textParts = newNote.split(regex);
      setHighlightedText(
         textParts.map((part, index) => {
            if (part.startsWith('#')) {
               return <Tag key={index} color={filteredTags.includes(part) ? 'blue' : undefined}>{part}</Tag>;
            }
            return part;
         })
      );
   }, [filteredTags, newNote, selectedTags]);


   return (
      <div className="notes-container">
         <h2>My Notes</h2>
         <div className="note-input">
            <TextArea
               value={newNote}
               onChange={(e) => setNewNote(e.target.value)}
               placeholder="Enter your note here..."
            />
            <Button type="primary" onClick={handleAddNote}>
               Add Note
            </Button>
         </div>
         <div className="tag-filter">
            {tags?.map((tag: any) => (
               <Tag
                  key={tag}
                  color={filteredTags.includes("#" + tag) ? 'blue' : undefined}
                  className="note-tag"
                  onClick={() => handleTagClick(tag)}
               >
                  #{tag}
               </Tag>
            ))}
         </div>
         <List
            dataSource={notes.filter((note: any) => {
               if (selectedTags.length === 0) return true;
               return note?.tags?.some((tag: any) => selectedTags.includes(tag));
            })}
            renderItem={(note: any) => (
               <List.Item className="note-item" key={note.id}>
                  {editingNoteId === note.id ? (
                     <>
                        <div
                           className="note-textarea editable"
                           contentEditable
                           onInput={handleNoteTextEdit}
                           suppressContentEditableWarning
                        >
                           {editedNoteText || note.text}
                        </div>
                        <div className="tag-container">
                           {extractTagsFromText(editedNoteText).map((tag) => (
                              <Tag key={tag} color="blue" className="note-tag">
                                 #{tag}
                              </Tag>
                           ))}
                        </div>
                        <Space>
                           <Button onClick={handleEditSave}>Save</Button>
                           <Button onClick={handleEditCancel}>Cancel</Button>
                        </Space>
                     </>
                  ) : (
                     <>
                        <div className="note-textarea">
                           {note.id === Date.now() ? highlightedText : note.text}
                        </div>
                        <div className="tag-container">
                           {note?.tags?.map((tag: any) => (
                              <Tag
                                 key={tag}
                                 color={selectedTags.includes(tag) ? 'blue' : undefined}
                                 className="note-tag"
                                 onClick={() => handleTagClick(tag)}
                              >
                                 {tag}
                              </Tag>
                           ))}
                        </div>
                        <Space>
                           <Button onClick={() => handleDeleteNote(note.id)} className="delete-button">
                              Delete
                           </Button>
                           <Button onClick={() => handleEditStart(note)}>Edit</Button>
                        </Space>
                     </>
                  )}
               </List.Item>
            )}
         />
      </div>
   );
};

export default Notes;
