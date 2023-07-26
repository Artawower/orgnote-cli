import { SecondBrainPublishedConfig } from 'config.js';
import { NotesApi } from './notes-api.js';

type Api = { notes: NotesApi };
let api: Api;

function initApi(c: SecondBrainPublishedConfig): void {
  const notes = new NotesApi(c.remoteAddress);
  notes.defaultHeaders = {
    Authorization: `Bearer ${c.token}`,
  };
  api = { notes };
}

export function getApi(c: SecondBrainPublishedConfig): Api {
  if (!api) {
    initApi(c);
  }

  return api;
}
