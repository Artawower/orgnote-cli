import { OrgNotePublishedConfig } from 'config.js';
import { FilesApi } from './files-api.js';
import { NotesApi } from '../generated/api/api.js';

type Api = { notes: NotesApi; files: FilesApi };
let api: Api;

function initApi(c: OrgNotePublishedConfig): void {
  const defaultHeaders = {
    Authorization: `Bearer ${c.token}`,
  };
  const remoteApiAddress = c.remoteAddress;
  const notes = new NotesApi(remoteApiAddress);
  notes.defaultHeaders = defaultHeaders;

  const files = new FilesApi(remoteApiAddress);
  files.defaultHeaders = defaultHeaders;

  api = { notes, files };
}

export function getApi(c: OrgNotePublishedConfig): Api {
  if (!api) {
    initApi(c);
  }

  return api;
}
