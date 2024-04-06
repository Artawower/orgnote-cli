import { OrgNotePublishedConfig } from '../config.js';
import { encrypt, createMessage, readMessage, decrypt } from 'openpgp';
import { HandlersCreatingNote } from '../generated/api/api.js';

export async function encryptText(
  content: string,
  config: OrgNotePublishedConfig
): Promise<string> {
  validateEncryptionConfig(config);
  try {
    const message = await createMessage({
      text: content,
    });

    const encryptedMessage = await encrypt({
      message,
      format: 'armored',
      encryptionKeys: config.gpgPublicKey,
      signingKeys: config.gpgPrivateKey,
    });

    return encryptedMessage.toString();
  } catch (e) {
    // TODO: master check incorrect passphrase
    throw e;
  }
}

export async function decryptText(
  content: string,
  config: OrgNotePublishedConfig
): Promise<string> {
  validateEncryptionConfig(config);
  if (config.encrypt !== HandlersCreatingNote.EncryptedEnum.Gpg) {
    throw new Error(`Unsupported encryption method: ${config.encrypt}`);
  }

  const message = await readMessage({ armoredMessage: content });

  const { data: decryptedText } = await decrypt({
    message,
    decryptionKeys: config.gpgPrivateKey,
  });
  return decryptedText.toString();
}

function validateEncryptionConfig(
  config: OrgNotePublishedConfig
): void | never {
  if (config.encrypt !== HandlersCreatingNote.EncryptedEnum.Gpg) {
    throw new Error(`Unsupported encryption method: ${config.encrypt}`);
  }
  if (!config.gpgPublicKey) {
    throw new Error('Public key is not provided');
  }

  if (!config.gpgPrivateKey) {
    throw new Error('Private key is not provided');
  }
}
