import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';

export function writeContent(filePath: string, content: string): void {
  const filePathDir = dirname(filePath);
  if (!existsSync(filePathDir)) {
    mkdirSync(filePathDir, { recursive: true });
  }
  writeFileSync(filePath, content);
}
