import { existsSync, readFileSync } from 'fs';
import { extractFilenameFromPath } from './extract-file-name.js';
import { getLogger } from '../logger.js';

const logger = getLogger();

export const readFiles = (filePaths: string[]): Array<File> => {
  const files = filePaths.reduce((files, filePath) => {
    if (!existsSync(filePath)) {
      logger.warn(`[read-files.ts][readFiles]: file not found ${filePath}`);
      return files;
    }
    const blob = new Blob([readFileSync(filePath)]);
    return [...files, new File([blob], extractFilenameFromPath(filePath))];
  }, []);
  return files;
};
