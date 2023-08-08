import { extractFilenameFromPath } from './extract-file-name.js';

export function getRelativeNotePath(
  rootFolder: string,
  filePath: string
): string[] {
  if (!filePath.startsWith(rootFolder)) {
    return [extractFilenameFromPath(filePath)];
  }
  const fullRelativePath = filePath.slice(rootFolder.length).split('/');
  return fullRelativePath.slice(1);
}
