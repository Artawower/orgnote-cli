import { existsSync, statSync } from 'fs';
import { OrgNotePublishedConfig } from '../config.js';
import { getOrgFilesRecursively } from '../tools/read-orf-files-recursively.js';
import { prepareNotes } from '../tools/prepare-note.js';
import { getApi } from './sdk.js';
import { saveNotesLocally } from '../tools/save-note.js';
import { getLogger } from '../logger.js';
import { removeNotesLocally } from '../tools/remove-notes-locally.js';
import {
  deleteNotesInfo,
  getPreservedNotesInfo,
  preserveNotesInfo,
} from '../store/persistent-notes.js';
import { join } from 'path';
import { removeRenamedNotes } from '../tools/remove-renamed-notes.js';
import { sendNotesFiles } from './send-notes-files.js';
import { initStore } from '../store/store.js';
import { decryptNote } from '../tools/encryption.js';
import { ModelsPublicNote, HandlersCreatingNote } from 'orgnote-api/remote-api';

const logger = getLogger();
export async function syncNotes(config: OrgNotePublishedConfig): Promise<void> {
  const { get, set } = initStore(config.name);
  const lastEncryptionMethod = get('lastEncryptionMethod');
  const encryptionChanged =
    !lastEncryptionMethod || lastEncryptionMethod !== config.encrypt;
  const lastSync = new Date(
    encryptionChanged || !get('lastSync') ? 0 : get('lastSync')
  );
  logger.info(
    `✎: [sync-notes.ts][${new Date().toString()}] last sync from %o`,
    lastSync
  );
  logger.info(
    `✎: [sync-notes.ts][${new Date().toString()}] encryption changed from the last sync %o`,
    encryptionChanged
  );
  const notesFromLastSync = await getNotesFromLastSync(
    config,
    lastSync,
    encryptionChanged
  );

  const notesIdsFromLastSync = notesFromLastSync.map((n) => n.id);
  const deletedNotesIds = getDeletedNotesIds(config);
  const deletedNotesIdsWithoutRename = deletedNotesIds.filter(
    (id) => !notesIdsFromLastSync.includes(id)
  );

  preserveNotesInfo(config, notesFromLastSync);
  deleteNotesInfo(config, deletedNotesIds);

  const api = getApi(config);

  await sendNotesFiles(notesFromLastSync, config, config.rootFolder);

  const rspns = await api.notes.notesSyncPost({
    notes: notesFromLastSync,
    deletedNotesIds: deletedNotesIdsWithoutRename,
    timestamp: lastSync.toISOString(),
  });

  logger.info(
    `✎: [sync-notes.ts][${new Date().toString()}] \n  notes updated from remote:\n\t%o\n  notes ids to delete:\n\t%o`,
    rspns.data.data.notes.map((n) => `[id:${n.id}]: ${n.meta.title}`),
    rspns.data.data.deletedNotes.map(
      (n) => `[id:${n.id}]: ${n.filePath.join('/')}`
    )
  );

  const decryptedNotes = await decryptNotes(rspns.data.data.notes, config);
  removeNotesLocally(config, rspns.data.data.deletedNotes);
  removeRenamedNotes(config, decryptedNotes);
  saveNotesLocally(config, decryptedNotes);
  preserveNotesInfo(
    config,
    rspns.data.data.notes.map((n) => ({
      filePath: n.filePath,
      id: n.id,
      updatedAt: n.updatedAt,
    }))
  );

  set('lastSync', new Date());
  set('lastEncryptionMethod', config.encrypt);
}

async function decryptNotes(
  notes: ModelsPublicNote[],
  config: OrgNotePublishedConfig
): Promise<ModelsPublicNote[]> {
  return await Promise.all(
    notes.map(async (n) => {
      if (n.meta.published) {
        return n;
      }
      return decryptNote(n, config);
    })
  );
}

async function getNotesFromLastSync(
  config: OrgNotePublishedConfig,
  lastSync: Date,
  forceSetCurrentType = false
): Promise<HandlersCreatingNote[]> {
  const orgFiles = getOrgFilesRecursively(config.rootFolder);

  const notesFilesFromLastSync = orgFiles.filter((filePath) => {
    const fileStat = statSync(filePath);
    const fileLastModified = fileStat.mtime;
    const fileLastRenamed = fileStat.ctime;
    return fileLastModified > lastSync || fileLastRenamed > lastSync;
  });

  const nestedNotes = await Promise.all(
    notesFilesFromLastSync.map(
      async (filePath) => await prepareNotes(filePath, config)
    )
  );

  const notes = forceSetCurrentType
    ? nestedNotes.flat().map<HandlersCreatingNote>((n) => ({
        ...n,
        updatedAt: new Date().toISOString(),
        touchedAt: new Date().toISOString(),
      }))
    : nestedNotes.flat();

  logger.info(
    `✎: [sync-notes.ts][${new Date().toString()}] files found to sync %o`,
    notes.length
  );
  if (config.debug) {
    logger.info(
      `✎: [sync-notes.ts][${new Date().toString()}] notes from last sync:\n %o`,
      notes.map((n) => `${n.meta.title}`)
    );
  }
  return notes;
}

function getDeletedNotesIds(config: OrgNotePublishedConfig): string[] {
  const notesInfo = getPreservedNotesInfo(config);
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
