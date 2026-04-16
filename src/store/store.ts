import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import type { SyncedFile } from 'orgnote-api';
import { to } from 'orgnote-api/utils';
import { getStorePath } from '../tools/paths.js';

interface Store {
  files?: Record<string, SyncedFile>;
}

let store: Store;

const getDefaultStore = (): Store => ({ files: {} });

export const initStore = (accountName: string) => {
  const storeFile = getStorePath(accountName);

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
    const result = to(() => JSON.parse(readFileSync(storeFile).toString()))();
    if (result.isOk()) {
      store = result.value;
      return;
    }
    if ((result.error as NodeJS.ErrnoException).code === 'ENOENT') {
      store = getDefaultStore();
      return;
    }
    throw result.error;
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
