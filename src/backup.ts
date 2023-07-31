import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs';
import { getLogger } from './logger.js';
import path, { join } from 'path';
import { zip } from 'zip-a-folder';

const logger = getLogger();
export async function backupDirectory(
  dirPath: string,
  backupCount: number = 3,
  backupDir?: string
): Promise<void> {
  backupDir ??= path.basename(path.dirname(dirPath));
  createBackupDir(backupDir);
  clearOldBackups(backupDir, backupCount);
  const zipName = `${new Date().toISOString()}.zip`;
  const zipPath = join(backupDir, zipName);
  logger.info(
    `✎: [backup.ts][${new Date().toString()}] backups stored into %o`,
    zipPath
  );
  await zip(dirPath, zipPath);
}

function createBackupDir(backupDir: string): void {
  if (existsSync(backupDir)) {
    return;
  }
  mkdirSync(backupDir, { recursive: true });
}

function clearOldBackups(dir: string, backupCount: number): void {
  const files = readdirSync(dir)
    .map((name) => ({
      name,
      time: statSync(join(dir, name)).mtime.getTime(),
    }))
    .filter((file) => /\.zip$/.test(file.name))
    .sort((a, b) => b.time - a.time)
    .map((v) => v.name);
  const filesToDelete = files.slice(backupCount);
  logger.info(
    `✎: [backup.ts][${new Date().toString()}] old backups will be deleted %o`,
    filesToDelete
  );

  filesToDelete.forEach((file) => {
    unlinkSync(join(dir, file));
  });
}
