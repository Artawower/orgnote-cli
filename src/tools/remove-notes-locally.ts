import { deleteNotesInfo } from '../store/persistent-notes.js';
import { HandlersDeletedNote } from '../generated/api/api';
import { getLogger } from '../logger.js';
import { join } from 'path';
import { unlinkSync } from 'fs';

const logger = getLogger();
export function removeNotesLocally(
  rootFolder: string,
  deletedNotes: HandlersDeletedNote[]
): void {
  deletedNotes.forEach((n) => {
    const fullPath = join(rootFolder, ...n.filePath);
    try {
      unlinkSync(fullPath);
    } catch (e) {
      logger.warn(
        `✎: [remove-notes-locally.ts][${new Date().toString()}] note %o not found`,
        n.filePath.join('/')
      );
    }
  });
  deleteNotesInfo(deletedNotes.map((n) => n.id));
}
