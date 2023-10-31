import { OrgNotePublishedConfig } from '../config.js';
import { readFileSync, statSync } from 'fs';
import { parse, withMetaInfo } from 'org-mode-ast';
import { getRelativeNotePath } from './relative-file-path.js';
import { getLogger } from '../logger.js';
import { getOrgFilesRecursively } from './read-orf-files-recursively.js';
import { HandlersCreatingNote, ModelsPublicNote } from 'generated/api/api.js';

const logger = getLogger();
export function prepareNote(
  filePath: string,
  config: OrgNotePublishedConfig
): ModelsPublicNote {
  try {
    const relativeNotePath = getRelativeNotePath(config.rootFolder, filePath);
    const fileContent = readFileSync(filePath, 'utf8');
    const parsedDoc = parse(fileContent);
    const nodeTree = withMetaInfo(parsedDoc);
    const stat = statSync(filePath);
    const lastUpdatedTime = stat.mtime;
    const noteCreatedTime = stat.ctime;
    const lastTouched = stat.atime;

    const note: HandlersCreatingNote = {
      id: nodeTree.meta.id,
      meta: nodeTree.meta as any,
      content: fileContent,
      filePath: relativeNotePath,
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
    return note;
  } catch (e) {
    logger.error("Can't parse file: %o", filePath);
    throw e;
  }
}

export function prepareNotesRecursively(
  dirPath: string,
  config: OrgNotePublishedConfig
): ModelsPublicNote[] {
  const files = getOrgFilesRecursively(dirPath);

  return files.reduce((notes: ModelsPublicNote[], fileName: string) => {
    const collectedNote = prepareNote(fileName, config);

    if (collectedNote) {
      return [...notes, collectedNote];
    }

    return notes;
  }, []);
}

export function prepareNotes(
  path: string,
  config: OrgNotePublishedConfig
): ModelsPublicNote[] {
  const stats = statSync(path);
  if (stats.isDirectory()) {
    return prepareNotesRecursively(path, config);
  }
  const preparedNote = prepareNote(path, config);
  return preparedNote ? [preparedNote] : [];
}
