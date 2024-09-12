import type { OrgNotePublishedConfig } from 'config';
import { ModelsPublicNote } from 'orgnote-api/remote-api';
import { decryptNote } from '../tools/encryption.js';

export async function decryptNotes(
  notes: ModelsPublicNote[],
  config: OrgNotePublishedConfig
): Promise<[ModelsPublicNote, string][]> {
  return await Promise.all(
    notes.map(async (n) => {
      if (n.meta.published) {
        return [n, n.content];
      }
      return await decryptNote(n, config);
    })
  );
}
