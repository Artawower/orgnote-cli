import { readFiles } from '../tools/read-files.js';
import { SecondBrainPublishedConfig } from '../config.js';
import { getLogger } from '../logger.js';
import { dirname, join } from 'path';
import { prepareNotes } from '../tools/prepare-note.js';
import { getApi } from './sdk.js';
import { statSync } from 'fs';
import { HandlersCreatingNote } from 'generated/api/api.js';

const logger = getLogger();

const sendNotes = async (
  notes: HandlersCreatingNote[],
  config: SecondBrainPublishedConfig,
  dirPath: string
) => {
  const api = getApi(config);

  const files = readFiles(
    notes
      .flatMap((note) => note.meta.images?.map((img) => join(dirPath, img)))
      .filter((i) => !!i)
  );

  try {
    !!files.length && (await api.files.uploadFiles(files));
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
  path: string,
  config: SecondBrainPublishedConfig
): Promise<void> {
  const notes = prepareNotes(path, config);
  if (!notes.length) {
    return;
  }
  const stats = statSync(path);
  const isFile = stats.isFile();
  const realDir = isFile ? dirname(path) : path;

  await sendNotes(notes, config, realDir);
}
