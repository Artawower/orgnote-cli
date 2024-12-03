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
    `[remove-notes-locally.ts][removeNoteLocally]: remove local note: %o`
  );
  try {
    unlinkSync(fullPath);
  } catch (e) {
    logger.debug(
      `[remove-notes-locally.ts][removeNoteLocally]: note %o was not found when attemptin to delete`,
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
