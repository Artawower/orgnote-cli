import { readFileSync, writeFileSync } from 'fs';
import os from 'os';

interface Store {
  lastSync?: Date;
}

let store: Store;
const storeFile = `${os.homedir()}/.config/second-brain/store.json`;

function readStore(): void {
  try {
    store = JSON.parse(readFileSync(storeFile).toString());
  } catch (e) {
    if (e.code === 'ENOENT') {
      store = {};
      return;
    }
    throw e;
  }
}

export function get(key: keyof Store): Store[keyof Store] {
  if (!store) {
    readStore();
  }
  return store[key];
}

function preserveStore(): void {
  writeFileSync(storeFile, JSON.stringify(store));
}

export function set(key: keyof Store, val: Store[keyof Store]): void {
  if (!store) {
    readStore();
  }
  store[key] = val;
  preserveStore();
}
