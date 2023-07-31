import { isOrgFile } from './is-org-file.js';
import { readFilesRecursively } from './read-files-recursively.js';

export function getOrgFilesRecursively(dirPath: string): string[] {
  const files = readFilesRecursively(dirPath);
  const orgFiles = files.filter((filePath) => isOrgFile(filePath));
  return orgFiles;
}
