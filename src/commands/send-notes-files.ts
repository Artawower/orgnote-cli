import { readFiles } from '../tools/read-files.js';
import { join } from 'path';
import { getApi } from './sdk.js';
import { OrgNotePublishedConfig } from '../config.js';
import { getLogger } from '../logger.js';
import { HandlersCreatingNote } from 'orgnote-api/remote-api';
import { prettifyHttpError } from '../tools/prettify-http-error';

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

  logger.info(
    `[send-notes-files.ts][functionsendNotesFiles]: files to sync: %o`,
    files.map((f) => f.name).join(', ')
  );
  logger.info(
    `[send-notes-files.ts][function]: files length to send ${files.length}`
  );

  files.forEach(async (file) => {
    try {
      await api.files.uploadFile(file);
    } catch (e) {
      logger.error(
        `[send-notes-files.ts][function]: http error while send http request for file upload: ${prettifyHttpError(e)} `
      );
    }
  });
}
