import { OrgNotePublishedConfig } from '../../config';
import { prepareNote } from '../prepare-note';
import { test, expect } from 'vitest';
import {
  armoredPublicKey,
  armoredPrivateKey,
  privateKeyPassphrase,
} from './fixtures';

const config: OrgNotePublishedConfig = {
  remoteAddress: 'non',
  token: 'non',
  version: '0.0.1',
  rootFolder: './miescellaneous',
};

const gpgKeysConfig: OrgNotePublishedConfig = {
  remoteAddress: 'non',
  token: 'non',
  version: '0.0.1',
  rootFolder: './miescellaneous',
  encrypt: 'gpgKeys',
  gpgPublicKey: armoredPublicKey,
  gpgPrivateKey: armoredPrivateKey,
  gpgPrivateKeyPassphrase: privateKeyPassphrase,
};

test('Should prepare unencrypted note', async () => {
  const preparedNote = await prepareNote('./miscellaneous/test.org', config);
  delete preparedNote.content;
  delete preparedNote.createdAt;
  delete preparedNote.touchedAt;
  delete preparedNote.updatedAt;

  expect(preparedNote).toMatchInlineSnapshot(`
    {
      "encrypted": false,
      "filePath": [
        "test.org",
      ],
      "id": "unencrypted-note",
      "meta": {
        "description": "This is description of unencrypted note",
        "fileTags": [
          "tag1",
          "tag2",
          "tag3",
        ],
        "headings": [
          {
            "level": 1,
            "title": "Hello world",
          },
        ],
        "id": "unencrypted-note",
        "title": "My unencrypted note",
      },
    }
  `);
});

test('Should prepare gpg encrypted note!', async () => {
  const preparedNote = await prepareNote(
    './miscellaneous/test.org.gpg',
    gpgKeysConfig
  );

  expect(preparedNote.content.startsWith('-----BEGIN PGP MESSAGE-----')).toBe(
    true
  );

  delete preparedNote.content;
  delete preparedNote.createdAt;
  delete preparedNote.touchedAt;
  delete preparedNote.updatedAt;

  expect(preparedNote).toMatchInlineSnapshot(`
    {
      "encrypted": true,
      "filePath": [
        "test.org.gpg",
      ],
      "id": "unencrypted-note",
      "meta": {
        "id": "unencrypted-note",
        "images": undefined,
        "published": undefined,
      },
    }
  `);
});
