import { SecondBrainPublishedConfig } from '../config.js';
import { getApi } from './sdk.js';
import { backupDirectory } from '../backup.js';
import { ModelsPublicNote } from '../generated/api/api.js';
import { set } from '../store.js';
import { saveNoteLocally } from '../tools/save-note.js';

const notesLimit = 100;

export async function loadNotes(
  config: SecondBrainPublishedConfig
): Promise<void> {
  const notes = await getNotes(config);
  notes.forEach((n) => saveNoteLocally(config.rootFolder, n));
  set('lastSync', new Date());
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
