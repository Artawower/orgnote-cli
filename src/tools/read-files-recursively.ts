import { readdirSync } from 'fs';
import { resolve } from 'path';

export function readFilesRecursively(dirPath: string): string[] {
  const dirents = readdirSync(dirPath, { withFileTypes: true });

  return dirents.flatMap((dirent) => {
    const filePath = resolve(dirPath, dirent.name);

    if (dirent.isDirectory()) {
      return readFilesRecursively(filePath);
    }

    return filePath;
  });
}
