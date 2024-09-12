import { OrgNotePublishedConfig } from '../config.js';
import { readFileSync, Stats, statSync } from 'fs';
import { OrgNode, parse, withMetaInfo } from 'org-mode-ast';
import { getRelativeNotePath } from './relative-file-path.js';
import { getLogger } from '../logger.js';
import { getOrgFilesRecursively } from './read-orf-files-recursively.js';
import {
  HandlersCreatingNote,
  ModelsNoteMeta,
  ModelsPublicNote,
} from 'orgnote-api/remote-api';
import { decrypt, encryptNote } from './encryption';
import { isOrgGpgFile } from 'orgnote-api';

const logger = getLogger();
export async function prepareNote(
  filePath: string,
  config: OrgNotePublishedConfig
): Promise<HandlersCreatingNote> {
  try {
    const encrypted = isOrgGpgFile(filePath);
    const fileContent = readFileSync(filePath, encrypted ? null : 'utf8');

    const decryptedContent = encrypted
      ? await decrypt(fileContent, config)
      : fileContent;

    console.log(
      '✎: [line 18][prepare-note.ts] fileContent: ',
      encrypted,
      decryptedContent,
      typeof decryptedContent
    );
    const parsedDoc = parse(decryptedContent);
    const nodeTree = withMetaInfo(parsedDoc);

    const stat = statSync(filePath);

    const note = await getCreatingNote({
      nodeTree,
      content: decryptedContent,
      encrypted,
      stat,
      config,
      filePath,
    });

    if (!note.id) {
      logger.warn(
        `${filePath} is not a org roam file. Specify id in org PROPERTY keyword and make sure that file is *.org`
      );
      return;
    }

    return note;
  } catch (e) {
    logger.error("Can't parse file: %o", filePath);
    throw e;
  }
}

async function getCreatingNote({
  nodeTree,
  stat,
  config,
  filePath,
  encrypted,
  content,
}: {
  nodeTree: OrgNode;
  stat: Stats;
  config: OrgNotePublishedConfig;
  filePath: string;
  encrypted: boolean;
  content: string;
}): Promise<HandlersCreatingNote> {
  const relativeNotePath = getRelativeNotePath(config.rootFolder, filePath);

  const lastUpdatedTime = stat.mtime;
  const noteCreatedTime = stat.ctime;
  const lastTouched = stat.atime;
  const images = nodeTree.meta.images;

  const note: HandlersCreatingNote = {
    id: nodeTree.meta.id,
    meta: nodeTree.meta as unknown as ModelsNoteMeta,
    filePath: relativeNotePath,
    content,
    touchedAt: lastTouched.toISOString(),
    updatedAt: new Date(
      Math.max(lastUpdatedTime.getTime(), noteCreatedTime.getTime())
    ).toISOString(),
    createdAt: noteCreatedTime.toISOString(),
    encrypted,
  };

  if (!note.encrypted) {
    return note;
  }

  const [encryptedNote, encryptedContent] = await encryptNote(
    note as ModelsPublicNote,
    config
  );
  encryptedNote.content = encryptedContent;
  encryptedNote.meta.images = images;
  console.log('✎: [line 103][prepare-note.ts] encryptedNote: ', encryptedNote);
  return encryptedNote;
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
