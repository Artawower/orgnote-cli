export function getRelativeNotePath(
  rootFolder: string,
  filePath: string
): string[] {
  if (!filePath.startsWith(rootFolder)) {
    return [];
  }
  const fullRelativePath = filePath.slice(rootFolder.length).split('/');
  return fullRelativePath.slice(1);
}
