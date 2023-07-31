import { statSync } from 'fs';

import { SecondBrainPublishedConfig } from '../config.js';
import { get, set } from '../store.js';
import { getOrgFilesRecursively } from '../tools/read-orf-files-recursively.js';
import { prepareNotes } from '../tools/prepare-note.js';
import { getApi } from './sdk.js';
import { saveNotesLocally } from '../tools/save-note.js';
import { HandlersCreatingNote } from 'generated/api/api.js';

export async function syncNotes(
  config: SecondBrainPublishedConfig
): Promise<void> {
  const lastSync = new Date(get('lastSync') ?? 0);
  const notesFromLastSync = getNotesFromLastSync(config, lastSync);

  const api = getApi(config);

  const rspns = await api.notes.notesSyncPost({
    notes: notesFromLastSync,
    timestamp: lastSync.toISOString(),
  });
  saveNotesLocally(config.rootFolder, rspns.body.data);
  set('lastSync', new Date());
  return;
}

function getNotesFromLastSync(
  config: SecondBrainPublishedConfig,
  lastSync: Date
): HandlersCreatingNote[] {
  const orgFiles = getOrgFilesRecursively(config.rootFolder);

  const notesFilesFromLastSync = orgFiles.filter((filePath) => {
    const fileStat = statSync(filePath);
    const fileLastModified = fileStat.mtime;
    return fileLastModified > lastSync;
  });
  const notes = notesFilesFromLastSync.flatMap((filePath) =>
    prepareNotes(filePath, config)
  );
  return notes;
}
