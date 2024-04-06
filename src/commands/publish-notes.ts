import { OrgNotePublishedConfig } from '../config.js';
import { getLogger } from '../logger.js';
import { dirname } from 'path';
import { prepareNotes } from '../tools/prepare-note.js';
import { getApi } from './sdk.js';
import { statSync } from 'fs';
import { HandlersCreatingNote } from '../generated/api/api.js';
import { preserveNotesInfo } from '../store/persistent-notes.js';
import { sendNotesFiles } from './send-notes-files.js';

const logger = getLogger();

const sendNotes = async (
  notes: HandlersCreatingNote[],
  config: OrgNotePublishedConfig,
  dirPath: string
) => {
  const api = getApi(config);

  await sendNotesFiles(notes, config, dirPath);

  preserveNotesInfo(config, notes);

  try {
    await api.notes.notesBulkUpsertPut(notes);
  } catch (e) {
    const data = e.response?.data ?? e.body;
    logger.error(`🦄: [http error] error while send http request:
    | status: ${e.statusCode ?? ''}
    | data: ${data ? JSON.stringify(data) : ''}
    | message: ${e.message ?? ''}
`);
    process.exit(1);
  }
};

export async function publishNotes(
  config: OrgNotePublishedConfig,
  path?: string
): Promise<void> {
  const notePath = path ?? config.rootFolder;
  const notes = await prepareNotes(notePath, config);
  if (!notes.length) {
    return;
  }
  const stats = statSync(notePath);
  const isFile = stats.isFile();
  const realDir = isFile ? dirname(notePath) : notePath;

  await sendNotes(notes, config, realDir);
}
