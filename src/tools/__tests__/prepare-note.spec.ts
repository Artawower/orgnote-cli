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

  expect(preparedNote).toMatchInlineSnapshot(`
    {
      "content": ":PROPERTIES:
    :ID: unencrypted-note
    :END:

    #+TITLE: My unencrypted note
    #+DESCRIPTION: This is description of unencrypted note
    #+FILETAGS: :tag1:tag2:tag3:


    * Hello world
    ",
      "createdAt": "2024-09-06T08:07:44.593Z",
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
      "touchedAt": "2024-09-06T08:07:45.488Z",
      "updatedAt": "2024-09-06T08:07:44.593Z",
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

  expect(preparedNote).toMatchInlineSnapshot(`
    {
      "createdAt": "2024-09-06T12:01:43.527Z",
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
      "touchedAt": "2024-09-06T12:01:49.315Z",
      "updatedAt": "2024-09-06T12:01:43.527Z",
    }
  `);
});
