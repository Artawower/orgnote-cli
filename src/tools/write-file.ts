import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { getLogger } from '../logger.js';
import { dirname } from 'path';

const logger = getLogger();

export function writeContent(filePath: string, content: string): void {
  const filePathDir = dirname(filePath);
  if (!existsSync(filePathDir)) {
    mkdirSync(filePathDir, { recursive: true });
  }
  writeFileSync(filePath, content);
}
