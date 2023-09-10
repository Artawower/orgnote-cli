import { existsSync, statSync } from 'fs';
import { SecondBrainPublishedConfig } from '../config.js';
import { get, set } from '../store/store.js';
import { getOrgFilesRecursively } from '../tools/read-orf-files-recursively.js';
import { prepareNotes } from '../tools/prepare-note.js';
import { getApi } from './sdk.js';
import { saveNotesLocally } from '../tools/save-note.js';
import { HandlersCreatingNote } from 'generated/api/api.js';
import { getLogger } from '../logger.js';
import { removeNotesLocally } from '../tools/remove-notes-locally.js';
import {
  deleteNotesInfo,
  getPreservedNotesInfo,
  preserveNotesInfo,
} from '../store/persistent-notes.js';
import { join } from 'path';

const logger = getLogger();
export async function syncNotes(
  config: SecondBrainPublishedConfig
): Promise<void> {
  const lastSync = new Date(get('lastSync') ?? 0);
  const notesFromLastSync = getNotesFromLastSync(config, lastSync);
  const deletedNotesIds = getDeletedNotesIds(config);
  preserveNotesInfo(notesFromLastSync);
  deleteNotesInfo(deletedNotesIds);

  const api = getApi(config);

  const rspns = await api.notes.notesSyncPost({
    notes: notesFromLastSync,
    deletedNotesIds,
    timestamp: lastSync.toISOString(),
  });

  if (config.debug) {
    logger.info(
      `✎: [sync-notes.ts][${new Date().toString()}] \n  notes updated from remote:\n\t%o\n  notes ids to delete:\n\t%o`,
      rspns.body.data.notes.map((n) => `[id:${n.id}]: ${n.meta.title}`),
      rspns.body.data.deletedNotes.map(
        (n) => `[id:${n.id}]: ${n.filePath.join('/')}`
      )
    );
  }

  removeNotesLocally(config.rootFolder, rspns.body.data.deletedNotes);
  saveNotesLocally(config.rootFolder, rspns.body.data.notes);
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
  if (config.debug) {
    logger.info(
      `✎: [sync-notes.ts][${new Date().toString()}] notes from last sync:\n %o`,
      notes.map((n) => `${n.meta.title}`)
    );
  }
  return notes;
}

function getDeletedNotesIds(config: SecondBrainPublishedConfig): string[] {
  const notesInfo = getPreservedNotesInfo();
  const deletedNotesIds = Object.keys(notesInfo).reduce((acc, filePath) => {
    const fullPath = join(config.rootFolder, filePath);
    const fileExists = existsSync(fullPath);

    if (!fileExists) {
      acc.push(notesInfo[filePath].id);
    }
    return acc;
  }, []);

  return deletedNotesIds;
}
