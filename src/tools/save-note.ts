import { join } from 'path';
import { writeContent } from './write-file.js';
import { touch } from './touch.js';
import { getLogger } from '../logger.js';
import { ModelsPublicNote } from '../generated/api/api.js';

const logger = getLogger();
export function saveNoteLocally(rootFolder: string, n: ModelsPublicNote): void {
  const savePath = join(rootFolder, ...n.filePath);
  writeContent(savePath, n.content);
  touch(savePath, new Date(n.updatedAt));
}

export function saveNotesLocally(
  rootFolder: string,
  notes: ModelsPublicNote[]
): void {
  notes.forEach((n) => saveNoteLocally(rootFolder, n));
}
