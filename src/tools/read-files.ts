import { existsSync, readFileSync } from 'fs';
import { extractFilenameFromPath } from './extract-file-name.js';
import { getLogger } from '../logger.js';

const logger = getLogger();

export const readFiles = (
  filePaths: string[]
): Array<{ blob: Buffer; fileName: string }> => {
  const files = filePaths.reduce((files, filePath) => {
    if (!existsSync(filePath)) {
      logger.warn(
        `✎: [read-files.ts][${new Date().toString()}] file note found %o`,
        filePath
      );
      return files;
    }
    return [
      ...files,
      {
        blob: readFileSync(filePath),
        fileName: extractFilenameFromPath(filePath),
      },
    ];
  }, []);
  return files;
};
