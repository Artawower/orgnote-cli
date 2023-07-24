export const extractFilenameFromPath = (path: string): string =>
  path.split('/').pop() as string;
