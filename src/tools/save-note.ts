import { join } from 'path';
import { writeContent } from './write-file.js';
import { touch } from './touch.js';
import { getLogger } from '../logger.js';
import { getApi } from '../commands/sdk.js';
import { OrgNotePublishedConfig } from 'config.js';
import { createWriteStream } from 'fs';
import { ModelsPublicNote } from 'orgnote-api/remote-api/api';

const logger = getLogger();

async function saveNoteFiles(
  note: ModelsPublicNote,
  config: OrgNotePublishedConfig
): Promise<void> {
  const sdk = getApi(config);
  for (const f of note.meta?.images ?? []) {
    try {
      const remoteFilePath = `${note.author.id}/${f}`;
      const fileStream = await sdk.files.downloadFile(remoteFilePath);
      const fileDir = note.filePath?.slice(0, -1) || [];
      const savePath = join(config.rootFolder, ...fileDir, f);
      fileStream?.pipe(createWriteStream(savePath));
    } catch (e) {
      logger.error(
        `✎: [save-note.ts][${new Date().toString()}] error downloading image %`
      );
    }
  }
}

export async function saveNoteLocally(
  rootFolder: string,
  n: ModelsPublicNote
): Promise<void> {
  const savePath = join(rootFolder, ...n.filePath);
  writeContent(savePath, n.content);
  touch(savePath, new Date(n.updatedAt));
}

export async function saveNotesLocally(
  config: OrgNotePublishedConfig,
  notes: ModelsPublicNote[]
): Promise<void> {
  for (const n of notes) {
    await saveNoteLocally(config.rootFolder, n);
    await saveNoteFiles(n, config);
  }
}
