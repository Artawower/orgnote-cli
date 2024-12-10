import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs';
import { getLogger } from './logger.js';
import { join } from 'path';
import { zip } from 'zip-a-folder';

const logger = getLogger();
export async function backupDirectory(
  dirPath: string,
  backupDir?: string,
  backupCount: number = 20
): Promise<void> {
  if (!backupDir) {
    logger.warn(
      '\n' +
        `WARN! YOUR NOTES ARE NOT BACKUPED CAUSE OF MISSING BACKUP FOLDER
BE NOTICE. THE APP CURRENTLY IN THE BETA VERSION. YOU CAN LOOSE YOUR DATA AND NOTES!\n` +
        '-'.repeat(80)
    );
    return;
  }
  createBackupDir(backupDir);
  clearOldBackups(backupDir, backupCount);
  const zipName = `${new Date().toISOString()}.zip`;
  const zipPath = join(backupDir, zipName);
  logger.info(`[backup.ts][backupDirectory]: backups stored into %o`, zipPath);
  await zip(dirPath, zipPath);
}

function createBackupDir(backupDir: string): void {
  try {
    if (existsSync(backupDir)) {
      return;
    }
    mkdirSync(backupDir, { recursive: true });
  } catch (e) {
    logger.error(
      `[backup.ts][createBackupDir]: error while creating backup dir \n%o`,
      e
    );
  }
}

function clearOldBackups(dir: string, backupCount: number): void {
  if (!dir) {
    return;
  }
  try {
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
      `✎: [backup.ts][${new Date().toString()}] old backups will be deleted \n%o`,
      JSON.stringify(filesToDelete)
    );

    filesToDelete.forEach((file) => {
      unlinkSync(join(dir, file));
    });
  } catch (e) {
    logger.error(
      `✎: [backup.ts][clearOldBackups] error when clear old backups %o`,
      e
    );
  }
}
