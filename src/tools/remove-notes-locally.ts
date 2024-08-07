import { deleteNotesInfo } from '../store/persistent-notes.js';
import { getLogger } from '../logger.js';
import { join } from 'path';
import { unlinkSync } from 'fs';
import { OrgNotePublishedConfig } from '../config.js';
import { HandlersDeletedNote } from 'orgnote-api/remote-api';

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
  config: OrgNotePublishedConfig,
  deletedNotes: HandlersDeletedNote[]
): void {
  deletedNotes.forEach((n) => {
    removeNoteLocally(config.rootFolder, n);
  });
  deleteNotesInfo(
    config,
    deletedNotes.map((n) => n.id)
  );
}
