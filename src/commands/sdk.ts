import { OrgNotePublishedConfig } from 'config.js';
import { SyncApiFactory } from 'orgnote-api/remote-api';
import axios from 'axios';

type Api = {
  sync: ReturnType<typeof SyncApiFactory>;
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

  const sync = SyncApiFactory(null, '', axiosInstance);

  api = { sync };
}

export function getApi(c: OrgNotePublishedConfig): Api {
  if (!api) {
    initApi(c);
  }

  return api;
}
