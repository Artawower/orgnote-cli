import { OrgNotePublishedConfig } from '../config.js';
import {
  encryptNote as _encryptNote,
  decryptNote as _decryptNote,
} from 'orgnote-api';
import type { AbstractEncryptedNote } from 'orgnote-api';
import { ModelsPublicNote } from '../generated/api/api.js';
import { OrgNoteEncryption } from 'orgnote-api/models';

export async function encryptNote(
  note: ModelsPublicNote,
  config: OrgNotePublishedConfig
): Promise<ModelsPublicNote> {
  validateEncryptionConfig(config);
  if (
    !config.encrypt ||
    config.encrypt === ModelsPublicNote.EncryptedEnum.Disabled
  ) {
    return note;
  }
  const encryptParams: OrgNoteEncryption =
    config.encrypt === ModelsPublicNote.EncryptedEnum.GpgPassword
      ? {
          type: 'gpgPassword',
          password: config.gpgPassword,
        }
      : {
          type: 'gpgKeys',
          publicKey: config.gpgPublicKey,
          privateKey: config.gpgPrivateKey,
          privateKeyPassphrase: config.gpgPrivateKeyPassphrase,
        };

  const encryptedNote = (await _encryptNote(
    note as unknown as AbstractEncryptedNote,
    encryptParams
  )) as unknown as ModelsPublicNote;

  return encryptedNote;
}

export async function decryptNote(
  note: ModelsPublicNote,
  config: OrgNotePublishedConfig
): Promise<ModelsPublicNote> {
  validateEncryptionConfig(config);
  if (
    !config.encrypt ||
    config.encrypt === ModelsPublicNote.EncryptedEnum.Disabled
  ) {
    return note;
  }

  const decryptParams: OrgNoteEncryption =
    config.encrypt === ModelsPublicNote.EncryptedEnum.GpgPassword
      ? {
          type: 'gpgPassword',
          password: config.gpgPassword,
        }
      : {
          type: 'gpgKeys',
          publicKey: config.gpgPublicKey,
          privateKey: config.gpgPrivateKey,
          privateKeyPassphrase: config.gpgPrivateKeyPassphrase,
        };

  return (await _decryptNote(
    note as unknown as AbstractEncryptedNote,
    decryptParams
  )) as unknown as ModelsPublicNote;
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
  if (!config.encrypt) {
    return;
  }
  const isKeysEncryption =
    config.encrypt === ModelsPublicNote.EncryptedEnum.GpgKeys;
  const isPasswordEncryption =
    config.encrypt === ModelsPublicNote.EncryptedEnum.GpgPassword;

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
