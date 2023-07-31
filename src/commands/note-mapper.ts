import { MetaInfo } from 'org-mode-ast';
import {
  HandlersCreatingNote,
  ModelsNoteMeta,
  ModelsPublicNote,
} from '../generated/api/api';

// export function mapNoteToCreatingNote(note: Models): HandlersCreatingNote {
//   return {
//     id: note.id,
//     content: note.content,
//     filePath: note.filePath,
//     meta: note.meta as unknown as ModelsNoteMeta,
//   };
// }

// export function mapNotesToCreatingNotes(notes: Note[]): HandlersCreatingNote[] {
//   return notes.map((note) => mapNoteToCreatingNote(note));
// }

// export function mapPublicNoteToNote(note: ModelsPublicNote): Note {
//   return {
//     id: note.id,
//     content: note.content,
//     filePath: note.filePath,
//     meta: note.meta as unknown as MetaInfo,
//   };
// }
// export function mapPublicNotesToNotes(notes: ModelsPublicNote[]): Note[] {
//   return notes.map((note) => mapPublicNoteToNote(note));
// }
