import { deleteNotesInfo } from '../store/persistent-notes.js';
import { HandlersDeletedNote } from '../generated/api/api';
import { getLogger } from '../logger.js';
import { join } from 'path';
import { unlinkSync } from 'fs';

const logger = getLogger();

export function removeNoteLocally(
  rootFolder: string,
  deletedNote: HandlersDeletedNote
): void {
  const fullPath = join(rootFolder, ...deletedNote.filePath);
  logger.info(
    `✎: [remove-notes-locally.ts][${new Date().toString()}] remove note locally %o`,
    fullPath
  );
  try {
    unlinkSync(fullPath);
  } catch (e) {
    logger.warn(
      `✎: [remove-notes-locally.ts][${new Date().toString()}] note %o not found`,
      deletedNote.filePath.join('/')
    );
  }
}

export function removeNotesLocally(
  rootFolder: string,
  deletedNotes: HandlersDeletedNote[]
): void {
  deletedNotes.forEach((n) => {
    removeNoteLocally(rootFolder, n);
  });
  deleteNotesInfo(deletedNotes.map((n) => n.id));
}
