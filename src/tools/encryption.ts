import { OrgNotePublishedConfig } from '../config.js';
import {
  encryptNote as _encryptNote,
  decryptNote as _decryptNote,
  decrypt as _decrypt,
} from 'orgnote-api';
import {
  OrgNoteEncryption,
  WithDecryptionContent,
  WithEncryptionContent,
} from 'orgnote-api/models';
import {
  ModelsPublicNote,
  ModelsPublicNoteEncryptionTypeEnum,
} from 'orgnote-api/remote-api';

export async function encryptNote(
  note: ModelsPublicNote,
  config: OrgNotePublishedConfig
): Promise<[ModelsPublicNote, string]> {
  validateEncryptionConfig(config);
  if (
    !config.encrypt ||
    config.encrypt === ModelsPublicNoteEncryptionTypeEnum.Disabled
  ) {
    return [note, note.content];
  }
  const encryptParams: WithEncryptionContent<OrgNoteEncryption> =
    config.encrypt === ModelsPublicNoteEncryptionTypeEnum.GpgPassword
      ? {
          type: 'gpgPassword',
          password: config.gpgPassword,
          content: note.content,
          format: 'armored',
        }
      : {
          type: 'gpgKeys',
          publicKey: config.gpgPublicKey,
          privateKey: config.gpgPrivateKey,
          privateKeyPassphrase: config.gpgPrivateKeyPassphrase,
          content: note.content,
          format: 'armored',
        };

  const encryptedNote = _encryptNote<ModelsPublicNote>(note, encryptParams);

  return encryptedNote;
}

export async function decryptNote(
  note: ModelsPublicNote,
  config: OrgNotePublishedConfig
): Promise<[ModelsPublicNote, string]> {
  validateEncryptionConfig(config);
  if (
    !config.encrypt ||
    config.encrypt === ModelsPublicNoteEncryptionTypeEnum.Disabled
  ) {
    return [note, note.content];
  }

  const decryptParams: WithDecryptionContent<OrgNoteEncryption> =
    config.encrypt === ModelsPublicNoteEncryptionTypeEnum.GpgPassword
      ? {
          type: 'gpgPassword',
          password: config.gpgPassword,
          content: note.content,
        }
      : {
          type: 'gpgKeys',
          publicKey: config.gpgPublicKey,
          privateKey: config.gpgPrivateKey,
          privateKeyPassphrase: config.gpgPrivateKeyPassphrase,
          content: note.content,
        };

  const [decryptedNote, content] = await _decryptNote(note, decryptParams);
  return [decryptedNote, content];
}

export async function decrypt(
  content: string,
  config: OrgNotePublishedConfig
): Promise<string> {
  validateEncryptionConfig(config);

  const decryptParams: WithDecryptionContent<OrgNoteEncryption> =
    config.encrypt === ModelsPublicNoteEncryptionTypeEnum.GpgPassword
      ? {
          type: 'gpgPassword',
          password: config.gpgPassword,
          content,
        }
      : {
          type: 'gpgKeys',
          publicKey: config.gpgPublicKey,
          privateKey: config.gpgPrivateKey,
          privateKeyPassphrase: config.gpgPrivateKeyPassphrase,
          content,
        };
  const res = await _decrypt(decryptParams);
  return res;
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
    config.encrypt === ModelsPublicNoteEncryptionTypeEnum.GpgKeys;
  const isPasswordEncryption =
    config.encrypt === ModelsPublicNoteEncryptionTypeEnum.GpgPassword;

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
