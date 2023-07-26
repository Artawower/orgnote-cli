import { SecondBrainPublishedConfig } from '../config.js';
import { readdirSync, readFileSync, statSync } from 'fs';
import { parse, withMetaInfo } from 'org-mode-ast';
import { Note } from 'types';
import { getRelativeNotePath } from './relative-file-path.js';
import { getLogger } from '../logger.js';
import { resolve } from 'path';
import { isOrgFile } from './is-org-file.js';

const logger = getLogger();
export function prepareNote(
  filePath: string,
  config: SecondBrainPublishedConfig
): Note {
  const relativeNotePath = getRelativeNotePath(config.rootFolder, filePath);
  const fileContent = readFileSync(filePath, 'utf8');
  const parsedDoc = parse(fileContent);
  const nodeTree = withMetaInfo(parsedDoc);
  const note: Note = {
    id: nodeTree.meta.id,
    meta: nodeTree.meta,
    content: fileContent,
    filePath: relativeNotePath,
  };

  if (!note.id) {
    throw 'File is not a org roam file. Specify id in org PROPERTY keyword and make sure that file is *.org';
  }
  return note;
}

export function prepareNotesRecursively(
  dirPath: string,
  config: SecondBrainPublishedConfig
): Note[] {
  logger.info(
    `✎: [prepare-note.ts][${new Date().toString()}] dirPath %o`,
    dirPath
  );

  const files = getOrgFilesRecursively(dirPath);
  logger.info(
    `✎: [prepare-note.ts][${new Date().toString()}] file length %o`,
    files.length
  );

  return files.reduce((notes: Note[], fileName: string) => {
    logger.info(
      `✎: [prepare-note.ts][${new Date().toString()}] fileName %o`,
      fileName
    );

    const collectedNote = prepareNote(fileName, config);

    if (collectedNote) {
      return [...notes, collectedNote];
    }

    return notes;
  }, []);
}

function getOrgFilesRecursively(dirPath: string): string[] {
  const dirents = readdirSync(dirPath, { withFileTypes: true });

  return dirents.flatMap((dirent) => {
    const filePath = resolve(dirPath, dirent.name);

    if (dirent.isDirectory()) {
      return getOrgFilesRecursively(filePath);
    }

    return isOrgFile(filePath) ? filePath : [];
  });
}

export function prepareNotes(
  path: string,
  config: SecondBrainPublishedConfig
): Note[] {
  const stats = statSync(path);
  logger.info(
    `✎: [prepare-note.ts][${new Date().toString()}] is notes directory: %o`,
    stats.isDirectory()
  );
  const notes = stats.isDirectory()
    ? prepareNotesRecursively(path, config)
    : [prepareNote(path, config)];
  return notes;
}
