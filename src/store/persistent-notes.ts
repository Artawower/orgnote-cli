import { OrgNotePublishedConfig } from 'config';
import { getLogger } from '../logger.js';
import { initStore, StoredNoteInfo } from './store.js';

const logger = getLogger();
export function preserveNotesInfo(
  config: OrgNotePublishedConfig,
  updatedNotesInfo: Partial<StoredNoteInfo>[]
): void {
  const { get, set } = initStore(config.name);
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

export function getPreservedNotesInfo(config: OrgNotePublishedConfig): {
  [filePath: string]: StoredNoteInfo;
} {
  const { get } = initStore(config.name);
  return get('notes');
}

export function deleteNotesInfo(
  config: OrgNotePublishedConfig,
  deletedNotesIds: string[]
): void {
  if (!deletedNotesIds.length) {
    return;
  }
  const { get, set } = initStore(config.name);
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
