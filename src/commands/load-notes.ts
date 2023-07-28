import { Note } from '../types.js';
import { SecondBrainPublishedConfig } from '../config.js';
import { getApi } from './sdk.js';
import { getLogger } from '../logger.js';
import { backupDirectory } from '../backup.js';
import { join } from 'path';
import { writeContent } from '../tools/write-file.js';
import { touch } from '../tools/touch.js';
import { ModelsPublicNote } from '../generated/api/api.js';

const notesLimit = 100;

const logger = getLogger();
export async function loadNotes(
  config: SecondBrainPublishedConfig
): Promise<void> {
  const notes = await getNotes(config);
  notes.forEach((n) => saveNoteLocally(config.rootFolder, n));
  backupDirectory(config.rootFolder, config.backupCount, config.backupDir);
}

async function getNotes(
  config: SecondBrainPublishedConfig
): Promise<ModelsPublicNote[]> {
  const api = getApi(config);
  let notes: ModelsPublicNote[] = [];
  let offset = 0;
  while (true) {
    const rspns = await api.notes.notesGet(
      notesLimit,
      offset,
      null,
      null,
      true
    );
    offset += notesLimit;
    notes.push(...rspns.body.data);
    if (notes.length === rspns.body.meta.total) {
      break;
    }
  }

  return notes;
}

function saveNoteLocally(rootFolder: string, n: ModelsPublicNote): void {
  const savePath = join(rootFolder, ...n.filePath);
  writeContent(savePath, n.content);
  touch(savePath, new Date(n.updatedAt));
  logger.info(
    `✎: [load-notes.ts][${new Date().toString()}] note: %o saved`,
    n.filePath?.[n.filePath.length - 1]
  );
}
