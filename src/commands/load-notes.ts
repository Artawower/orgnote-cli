import { OrgNotePublishedConfig } from '../config.js';
import { getApi } from './sdk.js';
import { initStore } from '../store/store.js';
import { saveNoteLocally } from '../tools/save-note.js';
import { ModelsPublicNote } from 'orgnote-api/remote-api';
import { decryptNotes } from './decrypt-notes.js';

const notesLimit = 100;

export async function loadNotes(config: OrgNotePublishedConfig): Promise<void> {
  const notes = await getNotes(config);
  const decryptedNotes = await decryptNotes(notes, config);
  decryptedNotes.forEach(([n, content]) =>
    saveNoteLocally(config.rootFolder, n, content)
  );
  const { set } = initStore(config.name);
  set('lastSync', new Date());
}

async function getNotes(
  config: OrgNotePublishedConfig
): Promise<ModelsPublicNote[]> {
  const api = getApi(config);
  let notes: ModelsPublicNote[] = [];
  let offset = 0;
  while (true) {
    const rspns = await api.notes.notesGet(
      notesLimit,
      offset,
      null,
      null,
      true
    );
    offset += notesLimit;
    notes.push(...rspns.data.data);
    if (notes.length === rspns.data.meta.total) {
      break;
    }
  }

  return notes;
}
