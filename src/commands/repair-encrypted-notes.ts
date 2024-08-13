import { readFileSync, writeFileSync } from 'fs';
import {
  decryptViaKeys,
  decryptViaPassword,
  isGpgEncrypted,
} from 'orgnote-api';
import { ModelsPublicNoteEncryptionTypeEnum } from 'orgnote-api/remote-api';
import { OrgNotePublishedConfig } from '../config.js';
import { getLogger } from '../logger.js';
import { readFilesRecursively } from '../tools/read-files-recursively.js';

/*
 * Temporary function to repair encrypted notes
 * https://github.com/Artawower/orgnote/issues/12#issuecomment-2286228208
 */
export async function repairEncryptedNotes(
  config: OrgNotePublishedConfig
): Promise<void> {
  const logger = getLogger();
  const files = readFilesRecursively(config.rootFolder);

  if (config.encrypt === ModelsPublicNoteEncryptionTypeEnum.Disabled) {
    logger.warn('Encryption is disabled. Skip repairing encrypted notes');
    return;
  }

  files.forEach(async (file) => {
    const content = readFileSync(file, 'utf8');
    if (!isGpgEncrypted(content)) {
      return;
    }

    try {
      const decryptedContent =
        config.encrypt === ModelsPublicNoteEncryptionTypeEnum.GpgKeys
          ? await decryptViaKeys(
              content,
              config.gpgPrivateKey,
              config.gpgPrivateKeyPassphrase
            )
          : await decryptViaPassword(content, config.gpgPassword);
      writeFileSync(file, decryptedContent, 'utf8');
      logger.info(`${file} note decrypted`);
    } catch (e) {
      logger.warn(`Can't decrypt note: ${file} cause of %o`, e);
    }
  });
}
