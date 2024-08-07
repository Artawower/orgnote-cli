import { readFiles } from '../tools/read-files.js';
import { join } from 'path';
import { getApi } from './sdk.js';
import { OrgNotePublishedConfig } from '../config.js';
import { getLogger } from '../logger.js';
import { HandlersCreatingNote } from 'orgnote-api/remote-api';

const logger = getLogger();
export async function sendNotesFiles(
  notes: HandlersCreatingNote[],
  config: OrgNotePublishedConfig,
  dirPath: string
): Promise<void> {
  const api = getApi(config);
  const filePaths = notes.flatMap((note) => {
    const relativePath = note.filePath.slice(0, -1);
    const mediaPath = dirPath.endsWith(relativePath.join('/'))
      ? []
      : relativePath;

    const joined = note.meta.images?.map((img) =>
      join(dirPath, ...mediaPath, img)
    );

    return joined;
  });

  const files = readFiles(filePaths.filter((i) => !!i));

  logger.info(`Files to sync: ${files.map((f) => f.name).join(', ')}`);
  logger.info(`Files length to send: ${files.length}`);

  files.forEach(async (file) => {
    try {
      await api.files.uploadFile(file);
    } catch (e) {
      const data = e.response?.data ?? e.body;
      logger.error(`🦄: [http error] error while send http request for file upload:
    | status: ${e.statusCode ?? ''}
    | data: ${data ? JSON.stringify(data) : ''}
    | message: ${e.message ?? ''}
`);
    }
  });
}
