import { OrgNotePublishedConfig } from 'config.js';
import { NotesApiFactory } from 'orgnote-api/remote-api';
import axios from 'axios';
import { initFilesApi } from 'orgnote-api';

type Api = {
  notes: ReturnType<typeof NotesApiFactory>;
  files: ReturnType<typeof initFilesApi>;
};
let api: Api;

function initApi(c: OrgNotePublishedConfig): void {
  const axiosInstance = axios.create({
    baseURL: c.remoteAddress,
    timeout: +process.env.REQUEST_TIMEOUT || 15000,
    headers: {
      Authorization: `Bearer ${c.token}`,
    },
  });

  const notes = NotesApiFactory(null, '', axiosInstance);
  const files = initFilesApi(axiosInstance);

  api = { notes, files };
}

export function getApi(c: OrgNotePublishedConfig): Api {
  if (!api) {
    initApi(c);
  }

  return api;
}
