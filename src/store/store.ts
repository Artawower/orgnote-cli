import { readFileSync, writeFileSync } from 'fs';
import { getLogger } from '../logger.js';
import os from 'os';
import { join } from 'path/posix';

const logger = getLogger();

export interface StoredNoteInfo {
  filePath: string[];
  id: string;
  updatedAt: string;
}

interface Store {
  lastSync?: Date;
  notes?: { [filePath: string]: StoredNoteInfo };
}

let store: Store;

const getDefaultStore = (): Store => ({ notes: {} });

export const initStore = (userName: string) => {
  const storeFile = join(
    os.homedir(),
    '.config/orgnote',
    `store-${userName}.json`
  );

  const preserveStore = (): void => {
    writeFileSync(storeFile, JSON.stringify(store));
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
      if (e.code === 'ENOENT') {
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
