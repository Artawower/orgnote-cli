import {
  deleteNotesInfo,
  getPreservedNotesInfo,
} from '../store/persistent-notes.js';
import { getLogger } from '../logger.js';
import { join } from 'path';
import { ModelsPublicNote } from 'generated/api/api.js';
import { removeNoteLocally } from './remove-notes-locally.js';

const logger = getLogger();
export function removeRenamedNotes(
  rootFolder: string,
  deletedNotes: ModelsPublicNote[]
): void {
  const notesInfo = getPreservedNotesInfo();
  const notesInfoById = Object.values(notesInfo).reduce((acc, n) => {
    acc[n.id] = n;
    return acc;
  }, {});

  deletedNotes.forEach((n) => {
    const path = join(...n.filePath);
    if (notesInfo[path] || !notesInfoById[n.id]) {
      return;
    }
    logger.info(
      `✎: [remove-renamed-notes.ts][${new Date().toString()}] remove renamed note %o`,
      notesInfoById[n.id].filePath
    );
    removeNoteLocally(rootFolder, {
      filePath: notesInfoById[n.id].filePath,
      id: n.id,
    });
  });
}
