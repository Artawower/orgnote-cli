import { existsSync, readFileSync } from 'fs';
import { extractFilenameFromPath } from './extract-file-name.js';

export const readFiles = (
  filePaths: string[]
): Array<{ blob: Buffer; fileName: string }> => {
  const files = filePaths.reduce((files, filePath) => {
    if (!existsSync(filePath)) {
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
