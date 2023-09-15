import { OrgNotePublishedConfig } from 'config.js';
import { FilesApi } from './files-api.js';
import { NotesApi } from '../generated/api/api.js';

type Api = { notes: NotesApi; files: FilesApi };
let api: Api;

function initApi(c: OrgNotePublishedConfig): void {
  const defaultHeaders = {
    Authorization: `Bearer ${c.token}`,
  };
  const notes = new NotesApi(c.remoteAddress);
  notes.defaultHeaders = defaultHeaders;

  const files = new FilesApi(c.remoteAddress);
  files.defaultHeaders = defaultHeaders;

  api = { notes, files };
}

export function getApi(c: OrgNotePublishedConfig): Api {
  if (!api) {
    initApi(c);
  }

  return api;
}
