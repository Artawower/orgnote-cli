import { readFileSync, writeFileSync } from 'fs';
import os from 'os';

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
// TODO: master file path for windows
const storeFile = `${os.homedir()}/.config/second-brain/store.json`;

const getDefaultStore = (): Store => ({ notes: {} });

function readStore(): void {
  try {
    store = JSON.parse(readFileSync(storeFile).toString());
  } catch (e) {
    if (e.code === 'ENOENT') {
      store = getDefaultStore();
      return;
    }
    throw e;
  }
}

export function get<K extends keyof Store>(key: K): Store[K] {
  if (!store) {
    readStore();
  }
  return store[key] ?? getDefaultStore()[key];
}

function preserveStore(): void {
  writeFileSync(storeFile, JSON.stringify(store));
}

export function set<K extends keyof Store>(key: K, val: Store[K]): void {
  if (!store) {
    readStore();
  }
  store[key] = val;
  preserveStore();
}
