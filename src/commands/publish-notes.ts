import { readFiles } from '../tools/read-files.js';
import { OrgNotePublishedConfig } from '../config.js';
import { getLogger } from '../logger.js';
import { dirname, join } from 'path';
import { prepareNotes } from '../tools/prepare-note.js';
import { getApi } from './sdk.js';
import { statSync } from 'fs';
import { HandlersCreatingNote } from '../generated/api/api.js';
import { preserveNotesInfo } from '../store/persistent-notes.js';

const logger = getLogger();

const sendNotes = async (
  notes: HandlersCreatingNote[],
  config: OrgNotePublishedConfig,
  dirPath: string
) => {
  const api = getApi(config);

  const files = readFiles(
    notes
      .flatMap((note) => {
        const relativePath = note.filePath.slice(0, -1);
        const mediaPath = dirPath.endsWith(relativePath.join('/'))
          ? []
          : relativePath;

        const joined = note.meta.images?.map((img) =>
          join(dirPath, ...mediaPath, img)
        );

        return joined;
      })
      .filter((i) => !!i)
  );

  preserveNotesInfo(notes);

  try {
    await api.files.uploadFiles(files);
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
  const notes = prepareNotes(notePath, config);
  if (!notes.length) {
    return;
  }
  const stats = statSync(notePath);
  const isFile = stats.isFile();
  const realDir = isFile ? dirname(notePath) : notePath;

  await sendNotes(notes, config, realDir);
}
