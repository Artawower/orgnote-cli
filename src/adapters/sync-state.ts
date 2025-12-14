import type { SyncState, SyncStateData, SyncedFile } from 'orgnote-api';
import { initStore } from '../store/store.js';

export const createSyncState = (accountName: string): SyncState => {
  const { get, set } = initStore(accountName);

  const getData = (): SyncStateData => {
    const files = get('files') ?? {};
    const lastSyncTime = get('lastSyncTime');
    return { files, lastSyncTime };
  };

  const saveData = (data: SyncStateData): void => {
    set('files', data.files);
    if (data.lastSyncTime) {
      set('lastSyncTime', data.lastSyncTime);
    }
  };

  return {
    get: async () => getData(),

    getFile: async (path: string) => {
      const data = getData();
      return data.files[path] ?? null;
    },

    setFile: async (path: string, file: SyncedFile) => {
      const data = getData();
      data.files[path] = file;
      saveData(data);
    },

    removeFile: async (path: string) => {
      const data = getData();
      delete data.files[path];
      saveData(data);
    },

    setLastSyncTime: async (time: string) => {
      set('lastSyncTime', time);
    },

    clear: async () => {
      set('files', {});
      set('lastSyncTime', undefined);
    },
  };
};
