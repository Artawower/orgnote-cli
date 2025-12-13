import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import os from 'os';
import { join, dirname } from 'path';
import type { SyncedFile } from 'orgnote-api';

interface Store {
  lastSyncTime?: string;
  files?: Record<string, SyncedFile>;
}

let store: Store;

const getDefaultStore = (): Store => ({ files: {} });

export const initStore = (accountName: string) => {
  const storeFile = join(
    os.homedir(),
    '.config/orgnote/store',
    `${accountName}.json`
  );

  const ensureStoreDir = (): void => {
    const dir = dirname(storeFile);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  };

  const preserveStore = (): void => {
    ensureStoreDir();
    writeFileSync(storeFile, JSON.stringify(store, null, 2));
  };

  const get = <K extends keyof Store>(key: K): Store[K] => {
    if (!store) {
      readStore();
    }
    return store[key] ?? getDefaultStore()[key];
  };

  const set = <K extends keyof Store>(key: K, val: Store[K]): void => {
    if (!store) {
      readStore();
    }
    store[key] = val;
    preserveStore();
  };

  const readStore = (): void => {
    try {
      store = JSON.parse(readFileSync(storeFile).toString());
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
        store = getDefaultStore();
        return;
      }
      throw e;
    }
  };

  const clear = (): void => {
    store = getDefaultStore();
    preserveStore();
  };

  return {
    preserveStore,
    get,
    set,
    clear,
  };
};
