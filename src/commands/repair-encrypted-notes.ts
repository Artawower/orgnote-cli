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
    logger.warn(
      `[repair-encrypted-notes.ts][function]: Encryption is disabled. Skip repairing encrypted notes`
    );
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
          ? await decryptViaKeys({
              content,
              publicKey: config.gpgPublicKey,
              privateKey: config.gpgPrivateKey,
              privateKeyPassphrase: config.gpgPrivateKeyPassphrase,
            })
          : await decryptViaPassword({ content, password: config.gpgPassword });
      writeFileSync(file, decryptedContent, 'utf8');
      logger.debug(
        `[repair-encrypted-notes.ts][function]: ${file} note decrypted`
      );
    } catch (e) {
      logger.error(
        `[repair-encrypted-notes.ts][function]: can't decrypt note: ${file} due to the error \n%o`,
        e
      );
    }
  });
}
