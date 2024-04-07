import { OrgNotePublishedConfig } from '../config.js';
import { encrypt, createMessage, readMessage, decrypt } from 'openpgp';
import { HandlersCreatingNote } from '../generated/api/api.js';

export async function encryptText(
  content: string,
  config: OrgNotePublishedConfig
): Promise<string> {
  validateEncryptionConfig(config);
  if (config.encrypt === HandlersCreatingNote.EncryptedEnum.Password) {
    return encryptViaPassword(content, config);
  }
  if (config.encrypt === HandlersCreatingNote.EncryptedEnum.Gpg) {
    return encryptViaKeys(content, config);
  }
}

async function encryptViaPassword(
  content: string,
  config: OrgNotePublishedConfig
): Promise<string> {
  const message = await createMessage({
    text: content,
  });

  const encryptedMessage = await encrypt({
    message,
    format: 'armored',
    passwords: config.gpgPassword,
  });

  return encryptedMessage.toString();
}

async function encryptViaKeys(
  content: string,
  config: OrgNotePublishedConfig
): Promise<string> {
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

  if (config.encrypt === HandlersCreatingNote.EncryptedEnum.Password) {
    return decryptViaPassword(content, config);
  }

  if (config.encrypt === HandlersCreatingNote.EncryptedEnum.Gpg) {
    return decryptViaKeys(content, config);
  }
}

async function decryptViaPassword(
  content: string,
  config: OrgNotePublishedConfig
): Promise<string> {
  const message = await readMessage({ armoredMessage: content });

  const { data: decryptedText } = await decrypt({
    message,
    passwords: config.gpgPassword,
  });
  return decryptedText.toString();
}

async function decryptViaKeys(
  content: string,
  config: OrgNotePublishedConfig
): Promise<string> {
  const message = await readMessage({ armoredMessage: content });

  const { data: decryptedText } = await decrypt({
    message,
    decryptionKeys: config.gpgPrivateKey,
  });
  return decryptedText.toString();
}

export class GpgPublicKeyIsNotProvidedError extends Error {
  constructor() {
    super('Public key is not provided');
  }
}

export class GpgPrivateKeyIsNotProvidedError extends Error {
  constructor() {
    super('Private key is not provided');
  }
}

export class GpgPasswordIsNotProvidedError extends Error {
  constructor() {
    super('Encryption password is not provided');
  }
}

export class UnsupportedEncryptionMethodError extends Error {
  constructor(encrypt: string) {
    super(`Unsupported encryption method: ${encrypt}`);
  }
}

function validateEncryptionConfig(
  config: OrgNotePublishedConfig
): void | never {
  const isKeysEncryption =
    config.encrypt === HandlersCreatingNote.EncryptedEnum.Gpg;
  const isPasswordEncryption =
    config.encrypt === HandlersCreatingNote.EncryptedEnum.Password;

  if (isKeysEncryption && !config.gpgPublicKey) {
    throw new GpgPublicKeyIsNotProvidedError();
  }

  if (isKeysEncryption && !config.gpgPrivateKey) {
    throw new GpgPrivateKeyIsNotProvidedError();
  }

  if (isPasswordEncryption && !config.gpgPassword) {
    throw new GpgPasswordIsNotProvidedError();
  }

  if (!isKeysEncryption && !isPasswordEncryption) {
    throw new UnsupportedEncryptionMethodError(
      config.encrypt as unknown as string
    );
  }
}
