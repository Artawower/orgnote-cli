import { getLogger } from '../logger.js';
import { StoredNoteInfo, get, set } from './store.js';

const logger = getLogger();
export function preserveNotesInfo(
  updatedNotesInfo: Partial<StoredNoteInfo>[]
): void {
  const notes = get('notes');
  updatedNotesInfo.forEach((n) => {
    if (!n.id || !n.filePath) {
      logger.warn(
        `✎: [persistent-notes.ts][${new Date().toString()}] file id or file path are not present %o`,
        n
      );
      return;
    }
    const path = n.filePath.join('/');
    notes[path] = { filePath: n.filePath, id: n.id, updatedAt: n.updatedAt };
  });
  set('notes', notes);
}

export function getPreservedNotesInfo(): {
  [filePath: string]: StoredNoteInfo;
} {
  return get('notes');
}

export function deleteNotesInfo(deletedNotesIds: string[]): void {
  if (!deletedNotesIds.length) {
    return;
  }
  const notes = get('notes');
  const notesAfterDeletion = Object.keys(notes).reduce((acc, key) => {
    const note = notes[key];
    if (!deletedNotesIds.includes(note.id)) {
      acc[key] = note;
    }
    return acc;
  }, {});
  set('notes', notesAfterDeletion);
}
