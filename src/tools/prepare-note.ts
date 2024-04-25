import { OrgNotePublishedConfig } from '../config.js';
import { readFileSync, statSync } from 'fs';
import { parse, withMetaInfo } from 'org-mode-ast';
import { getRelativeNotePath } from './relative-file-path.js';
import { getLogger } from '../logger.js';
import { getOrgFilesRecursively } from './read-orf-files-recursively.js';
import {
  HandlersCreatingNote,
  ModelsPublicNote,
} from '../generated/api/api.js';
import { encryptNote } from 'orgnote-api/encryption';
import { ModelsPublicNoteEncryptedEnum } from 'orgnote-api/remote-api';

const logger = getLogger();
export async function prepareNote(
  filePath: string,
  config: OrgNotePublishedConfig
): Promise<HandlersCreatingNote> {
  try {
    const relativeNotePath = getRelativeNotePath(config.rootFolder, filePath);
    const fileContent = readFileSync(filePath, 'utf8');
    const parsedDoc = parse(fileContent);
    const nodeTree = withMetaInfo(parsedDoc);

    const stat = statSync(filePath);
    const lastUpdatedTime = stat.mtime;
    const noteCreatedTime = stat.ctime;
    const lastTouched = stat.atime;

    // TODO: feat/gpg-encryption удаление меты в апи.
    const meta = (nodeTree.meta.published || !config.encrypt
      ? nodeTree.meta
      : { id: nodeTree.meta.id }) as unknown as ModelsPublicNote['meta'];

    const note: HandlersCreatingNote = {
      id: nodeTree.meta.id,
      meta,
      filePath: relativeNotePath,
      content: fileContent,
      touchedAt: lastTouched.toISOString(),
      updatedAt: new Date(
        Math.max(lastUpdatedTime.getTime(), noteCreatedTime.getTime())
      ).toISOString(),
      createdAt: noteCreatedTime.toISOString(),
    };

    if (!note.id) {
      logger.warn(
        `${filePath} is not a org roam file. Specify id in org PROPERTY keyword and make sure that file is *.org`
      );
      return;
    }
    // TODO: feat/gpg-encryption fix types after changing codegeneration
    const encryptedNote = await encryptNote(note as any, {
      type: config.encrypt as unknown as ModelsPublicNoteEncryptedEnum,
      password: config.gpgPassword,
      publicKey: config.gpgPublicKey,
      privateKey: config.gpgPrivateKey,
      privateKeyPassphrase: config.gpgPrivateKeyPassphrase,
    });
    logger.info(`Note encrypted: %o`, encryptedNote);
    return encryptedNote;
  } catch (e) {
    logger.error("Can't parse file: %o", filePath);
    throw e;
  }
}

export async function prepareNotesRecursively(
  dirPath: string,
  config: OrgNotePublishedConfig
): Promise<HandlersCreatingNote[]> {
  const files = getOrgFilesRecursively(dirPath);

  return await files.reduce(
    async (notes: Promise<HandlersCreatingNote[]>, fileName: string) => {
      const collectedNote = await prepareNote(fileName, config);

      if (collectedNote) {
        return [...(await notes), collectedNote];
      }

      return await notes;
    },
    Promise.resolve([])
  );
}

export async function prepareNotes(
  path: string,
  config: OrgNotePublishedConfig
): Promise<HandlersCreatingNote[]> {
  const stats = statSync(path);
  if (stats.isDirectory()) {
    return await prepareNotesRecursively(path, config);
  }
  const preparedNote = await prepareNote(path, config);
  return preparedNote ? [preparedNote] : [];
}
